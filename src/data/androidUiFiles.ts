import { AndroidSourceFile } from './androidCoreFiles';

export const ANDROID_UI_FILES: AndroidSourceFile[] = [
  {
    path: 'app/src/main/java/com/luna/companion/di/AppModule.kt',
    language: 'kotlin',
    summary: 'Hilt Dependency Injection module providing Room Database, DAOs, OkHttpClient, and Gson',
    content: `package com.luna.companion.di

import android.content.Context
import androidx.room.Room
import com.google.gson.Gson
import com.luna.companion.data.local.db.ChatDao
import com.luna.companion.data.local.db.LunaDatabase
import com.luna.companion.data.local.db.TaskDao
import com.luna.companion.data.local.db.WellbeingDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): LunaDatabase {
        return Room.databaseBuilder(
            context,
            LunaDatabase::class.java,
            "luna_companion.db"
        ).fallbackToDestructiveMigration().build()
    }

    @Provides fun provideChatDao(db: LunaDatabase): ChatDao = db.chatDao()
    @Provides fun provideTaskDao(db: LunaDatabase): TaskDao = db.taskDao()
    @Provides fun provideWellbeingDao(db: LunaDatabase): WellbeingDao = db.wellbeingDao()

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .connectTimeout(25, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideGson(): Gson = Gson()
}
`,
  },
  {
    path: 'app/src/main/java/com/luna/companion/ui/theme/LunaTheme.kt',
    language: 'kotlin',
    summary: 'Material 3 dark plum/purple theme with rose-pink and lavender accents',
    content: `package com.luna.companion.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

object LunaColors {
    val BgPrimary = Color(0xFF1A1025)
    val BgSecondary = Color(0xFF22163A)
    val AccentRose = Color(0xFFFF4D8D)
    val AccentLavender = Color(0xFFB57BFF)
    val ListeningAmber = Color(0xFFFFB347)
    val SpeakingRose = Color(0xFFFF6BA8)
    val SuccessMint = Color(0xFF4DFFC3)
    val ErrorCoral = Color(0xFFFF5C5C)
    val TextPrimary = Color(0xFFFFFFFF)
    val TextSecondary = Color(0xFFC4B5D9)
    val GlassSurface = Color(0x0FFFFFFF)
}

private val LunaDarkScheme = darkColorScheme(
    primary = LunaColors.AccentRose,
    secondary = LunaColors.AccentLavender,
    background = LunaColors.BgPrimary,
    surface = LunaColors.BgSecondary,
    onPrimary = Color.White,
    onSecondary = LunaColors.BgPrimary,
    onBackground = LunaColors.TextPrimary,
    onSurface = LunaColors.TextPrimary,
    error = LunaColors.ErrorCoral
)

@Composable
fun LunaTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LunaDarkScheme,
        content = content
    )
}
`,
  },
  {
    path: 'app/src/main/java/com/luna/companion/ui/components/LunaOrb.kt',
    language: 'kotlin',
    summary: 'Animated Jetpack Compose Face & Orb reflecting IDLE, LISTENING, PROCESSING, SPEAKING, and ERROR states with blinking & lip-sync',
    content: `package com.luna.companion.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.luna.companion.ui.theme.LunaColors

enum class VoiceState { IDLE, LISTENING, PROCESSING, SPEAKING, ERROR }

@Composable
fun LunaOrb(
    state: VoiceState,
    size: Dp = 140.dp,
    onClick: () -> Unit = {}
) {
    val infiniteTransition = rememberInfiniteTransition(label = "luna_face")
    val duration = when (state) {
        VoiceState.SPEAKING -> 320
        VoiceState.LISTENING -> 650
        VoiceState.PROCESSING -> 850
        else -> 1800
    }
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.94f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(duration, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "orb_scale"
    )
    val mouthPulse by infiniteTransition.animateFloat(
        initialValue = 0.15f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(170, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "mouth_pulse"
    )
    val blinkProgress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = keyframes {
                durationMillis = 3600
                0f at 0
                0f at 3300
                1f at 3420
                0f at 3550
            },
            repeatMode = RepeatMode.Restart
        ),
        label = "blink"
    )

    val coreColor = when (state) {
        VoiceState.IDLE -> LunaColors.AccentRose
        VoiceState.LISTENING -> LunaColors.ListeningAmber
        VoiceState.PROCESSING -> LunaColors.AccentLavender
        VoiceState.SPEAKING -> LunaColors.SpeakingRose
        VoiceState.ERROR -> LunaColors.ErrorCoral
    }

    Canvas(
        modifier = Modifier
            .size(size)
            .clip(CircleShape)
            .clickable { onClick() }
    ) {
        val radius = (this.size.minDimension / 2f) * 0.74f * scale
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(coreColor.copy(alpha = 0.35f), Color.Transparent),
                center = center,
                radius = radius * 1.42f
            ),
            radius = radius * 1.42f,
            center = center
        )
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(Color(0xFF2B1B46), Color(0xFF1A1025)),
                center = center,
                radius = radius
            ),
            radius = radius,
            center = center
        )
        drawCircle(
            color = coreColor,
            radius = radius,
            center = center,
            style = Stroke(width = radius * 0.06f)
        )

        // Cute face silhouette inside orb
        val faceR = radius * 0.62f
        drawCircle(color = Color(0xFFF2C8AE), radius = faceR, center = center)

        // Rosy blush
        drawOval(
            color = Color(0xFFFF6BA8).copy(alpha = 0.32f),
            topLeft = Offset(center.x - faceR * 0.62f, center.y + faceR * 0.08f),
            size = Size(faceR * 0.36f, faceR * 0.18f)
        )
        drawOval(
            color = Color(0xFFFF6BA8).copy(alpha = 0.32f),
            topLeft = Offset(center.x + faceR * 0.26f, center.y + faceR * 0.08f),
            size = Size(faceR * 0.36f, faceR * 0.18f)
        )

        // Blinking eyes
        val eyeY = center.y - faceR * 0.12f
        val eyeDx = faceR * 0.34f
        if (blinkProgress > 0.5f) {
            drawLine(
                color = Color(0xFF221433),
                start = Offset(center.x - eyeDx - faceR * 0.12f, eyeY),
                end = Offset(center.x - eyeDx + faceR * 0.12f, eyeY),
                strokeWidth = faceR * 0.07f,
                cap = StrokeCap.Round
            )
            drawLine(
                color = Color(0xFF221433),
                start = Offset(center.x + eyeDx - faceR * 0.12f, eyeY),
                end = Offset(center.x + eyeDx + faceR * 0.12f, eyeY),
                strokeWidth = faceR * 0.07f,
                cap = StrokeCap.Round
            )
        } else {
            drawCircle(color = Color(0xFF1E132B), radius = faceR * 0.11f, center = Offset(center.x - eyeDx, eyeY))
            drawCircle(color = Color.White, radius = faceR * 0.038f, center = Offset(center.x - eyeDx + faceR * 0.03f, eyeY - faceR * 0.03f))
            drawCircle(color = Color(0xFF1E132B), radius = faceR * 0.11f, center = Offset(center.x + eyeDx, eyeY))
            drawCircle(color = Color.White, radius = faceR * 0.038f, center = Offset(center.x + eyeDx + faceR * 0.03f, eyeY - faceR * 0.03f))
        }

        // Expressive speaking / smiling mouth
        val mouthY = center.y + faceR * 0.38f
        if (state == VoiceState.SPEAKING) {
            val openH = faceR * (0.08f + mouthPulse * 0.18f)
            drawOval(
                color = Color(0xFF9E3B59),
                topLeft = Offset(center.x - faceR * 0.18f, mouthY - openH / 2f),
                size = Size(faceR * 0.36f, openH)
            )
        } else {
            val smile = Path().apply {
                moveTo(center.x - faceR * 0.2f, mouthY)
                quadraticBezierTo(center.x, mouthY + faceR * 0.18f, center.x + faceR * 0.2f, mouthY)
            }
            drawPath(
                path = smile,
                color = Color(0xFFC45C7B),
                style = Stroke(width = faceR * 0.065f, cap = StrokeCap.Round)
            )
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/luna/companion/ui/viewmodel/LunaViewModels.kt',
    language: 'kotlin',
    summary: 'ChatViewModel (with Voice State Machine), TaskViewModel, WellbeingViewModel, and SettingsViewModel',
    content: `package com.luna.companion.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.luna.companion.data.local.db.*
import com.luna.companion.data.local.preferences.*
import com.luna.companion.data.remote.AiRepository
import com.luna.companion.data.remote.ConnectionTestResult
import com.luna.companion.services.AlarmScheduler
import com.luna.companion.services.FlashlightController
import com.luna.companion.services.LunaSpeechRecognizer
import com.luna.companion.services.LunaTtsManager
import com.luna.companion.ui.components.VoiceState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

data class ChatUiState(
    val activeSessionId: String = "default",
    val voiceState: VoiceState = VoiceState.IDLE,
    val streamingReply: String = "",
    val errorBanner: String? = null,
    val liveTranscript: String = ""
)

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatDao: ChatDao,
    private val wellbeingDao: WellbeingDao,
    private val prefs: UserPreferencesManager,
    private val aiRepository: AiRepository,
    private val ttsManager: LunaTtsManager,
    private val speechRecognizer: LunaSpeechRecognizer,
    val flashlight: FlashlightController,
    private val musicEngine: com.luna.companion.services.LunaMusicEngine
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    val settings: StateFlow<LunaSettings> = prefs.settingsFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), LunaSettings())

    val messages: StateFlow<List<MessageEntity>> = _uiState
        .flatMapLatest { chatDao.observeMessages(it.activeSessionId) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val memories: StateFlow<List<MemoryFactEntity>> = wellbeingDao.observeMemories()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun sendMessage(text: String, isVoice: Boolean = false, imageBase64: String? = null) {
        val clean = text.trim()
        if (clean.isEmpty() || _uiState.value.voiceState == VoiceState.PROCESSING) return

        // Handle local flashlight & singing intents immediately
        val lower = clean.lowercase()
        if (lower.contains("টর্চ জ্বালাও") || lower.contains("flashlight on")) {
            flashlight.setTorch(true)
        } else if (lower.contains("টর্চ নিভাও") || lower.contains("flashlight off")) {
            flashlight.setTorch(false)
        }
        val wantsSong = lower.contains("গান") || lower.contains("sing") || lower.contains("music")

        viewModelScope.launch {
            val sessionId = _uiState.value.activeSessionId
            chatDao.upsertSession(
                SessionEntity(sessionId, clean.take(36), System.currentTimeMillis(), System.currentTimeMillis())
            )
            chatDao.insertMessage(
                MessageEntity(
                    sessionId = sessionId,
                    sender = "user",
                    text = clean,
                    timestamp = System.currentTimeMillis(),
                    isVoice = isVoice
                )
            )
            _uiState.update { it.copy(voiceState = VoiceState.PROCESSING, streamingReply = "", errorBanner = null) }

            val currentSettings = settings.value
            val accumulated = StringBuilder()

            runCatching {
                aiRepository.streamChat(
                    userMessage = clean,
                    history = messages.value,
                    memories = memories.value.map { it.fact },
                    settings = currentSettings,
                    imageBase64 = imageBase64
                ).collect { chunk ->
                    accumulated.append(chunk)
                    _uiState.update { it.copy(streamingReply = accumulated.toString()) }
                }
            }.onSuccess {
                val finalReply = accumulated.toString().trim()
                if (finalReply.isNotEmpty()) {
                    chatDao.insertMessage(
                        MessageEntity(
                            sessionId = sessionId,
                            sender = "luna",
                            text = finalReply,
                            timestamp = System.currentTimeMillis()
                        )
                    )
                    if (wantsSong || currentSettings.voiceReplyEnabled) {
                        _uiState.update { it.copy(voiceState = VoiceState.SPEAKING, streamingReply = "") }
                        if (wantsSong) {
                            musicEngine.startSoftAccompaniment()
                        }
                        ttsManager.speak(
                            finalReply,
                            if (wantsSong) 0.85f else currentSettings.ttsRate,
                            if (wantsSong) 1.12f else currentSettings.ttsPitch
                        ) {
                            musicEngine.stop()
                            _uiState.update { it.copy(voiceState = VoiceState.IDLE) }
                        }
                    } else {
                        _uiState.update { it.copy(voiceState = VoiceState.IDLE, streamingReply = "") }
                    }
                } else {
                    _uiState.update { it.copy(voiceState = VoiceState.IDLE, streamingReply = "") }
                }
            }.onFailure { err ->
                _uiState.update {
                    it.copy(
                        voiceState = VoiceState.ERROR,
                        streamingReply = "",
                        errorBanner = "আরে, কী হলো এটা 😕 \${err.localizedMessage}"
                    )
                }
            }
        }
    }

    fun startVoiceInput() {
        ttsManager.stop()
        _uiState.update { it.copy(voiceState = VoiceState.LISTENING, liveTranscript = "") }
        speechRecognizer.startListening(
            languageTag = settings.value.sttLanguage,
            onPartial = { partial -> _uiState.update { it.copy(liveTranscript = partial) } },
            onResult = { finalText ->
                _uiState.update { it.copy(liveTranscript = "") }
                if (finalText.isNotBlank()) sendMessage(finalText, isVoice = true)
                else _uiState.update { it.copy(voiceState = VoiceState.IDLE) }
            },
            onError = {
                _uiState.update { it.copy(voiceState = VoiceState.ERROR, errorBanner = "কথা বুঝতে পারিনি সোনা 😕") }
            }
        )
    }

    fun stopSpeakingOrListening() {
        musicEngine.stop()
        ttsManager.stop()
        speechRecognizer.stop()
        _uiState.update { it.copy(voiceState = VoiceState.IDLE) }
    }
}

@HiltViewModel
class TaskViewModel @Inject constructor(
    private val taskDao: TaskDao,
    private val alarmScheduler: AlarmScheduler
) : ViewModel() {
    val tasks: StateFlow<List<TaskEntity>> = taskDao.observeTasks()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val routines: StateFlow<List<ClassRoutineEntity>> = taskDao.observeRoutines()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun addTask(title: String, type: String, hour: Int, minute: Int, repeat: String, notes: String) {
        viewModelScope.launch {
            taskDao.insertTask(
                TaskEntity(title = title, type = type, triggerHour = hour, triggerMinute = minute, repeatPattern = repeat, notes = notes)
            )
        }
    }

    fun toggleTask(task: TaskEntity) {
        viewModelScope.launch { taskDao.updateTask(task.copy(isActive = !task.isActive)) }
    }

    fun deleteTask(task: TaskEntity) {
        viewModelScope.launch { taskDao.deleteTask(task) }
    }

    fun addClassRoutine(dayOfWeek: Int, dayLabel: String, hour24: Int, minute: Int, subject: String, room: String) {
        viewModelScope.launch {
            taskDao.insertRoutines(listOf(
                ClassRoutineEntity(dayOfWeek = dayOfWeek, dayLabel = dayLabel, hour24 = hour24, minute = minute, subject = subject, room = room)
            ))
            alarmScheduler.scheduleClassPreReminder(subject, room, dayOfWeek, hour24, minute)
        }
    }
}

@HiltViewModel
class WellbeingViewModel @Inject constructor(
    private val wellbeingDao: WellbeingDao
) : ViewModel() {
    val moods = wellbeingDao.observeMoods().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
    val sleeps = wellbeingDao.observeSleeps().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
    val photos = wellbeingDao.observePhotos().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun logMood(level: Int, label: String, note: String) {
        viewModelScope.launch {
            wellbeingDao.upsertMood(
                MoodEntryEntity(dateIso = LocalDate.now().toString(), moodLevel = level, moodLabel = label, userNote = note)
            )
        }
    }

    fun logSleep(sleepTime: String, wakeTime: String, durationMinutes: Int, quality: Int) {
        viewModelScope.launch {
            wellbeingDao.upsertSleep(
                SleepEntryEntity(dateSleep = LocalDate.now().toString(), timeSleep = sleepTime, timeWoke = wakeTime, durationMinutes = durationMinutes, qualityLevel = quality)
            )
        }
    }
}

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val prefs: UserPreferencesManager,
    private val keyManager: SecureApiKeyManager,
    private val aiRepository: AiRepository
) : ViewModel() {
    val settings = prefs.settingsFlow.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), LunaSettings())
    val apiKeys = keyManager.keys

    private val _testStatus = MutableStateFlow<String?>(null)
    val testStatus: StateFlow<String?> = _testStatus

    fun saveProfile(name: String, endearment: String, language: String, age: String, birthday: String) {
        viewModelScope.launch { prefs.updateProfile(name, endearment, language, age, birthday) }
    }

    fun toggleBackgroundMode(enabled: Boolean) {
        viewModelScope.launch { prefs.setBackgroundMode(enabled) }
    }

    fun addApiKey(provider: AiProvider, label: String, key: String) {
        keyManager.addKey(provider, label, key)
    }

    fun setActiveKey(id: String) = keyManager.setActiveKey(id)
    fun deleteKey(id: String) = keyManager.deleteKey(id)

    fun testConnection(provider: AiProvider, apiKey: String, model: String) {
        viewModelScope.launch {
            _testStatus.value = "Testing connection..."
            when (val res = aiRepository.testConnection(provider, apiKey, model)) {
                is ConnectionTestResult.Success -> _testStatus.value = "Connected: \${res.reply.take(60)}"
                is ConnectionTestResult.Failure -> _testStatus.value = "Failed: \${res.reason}"
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/luna/companion/ui/screens/LunaScreens.kt',
    language: 'kotlin',
    summary: 'Complete Jetpack Compose UI screens: Onboarding, Profile Setup, API Key Setup, Permissions, Main Chat, Voice, Tasks, Health, Photos, Storage, and Settings',
    content: `package com.luna.companion.ui.screens

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Environment
import android.provider.Settings
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.rememberMultiplePermissionsState
import com.luna.companion.data.local.preferences.AiProvider
import com.luna.companion.services.LunaForegroundService
import com.luna.companion.ui.components.LunaOrb
import com.luna.companion.ui.components.VoiceState
import com.luna.companion.ui.theme.LunaColors
import com.luna.companion.ui.viewmodel.*

@Composable
fun OnboardingScreen(onGetStarted: () -> Unit) {
    val cards = listOf(
        "আমি Luna — তোমার AI সঙ্গী 💕",
        "কথা বলো, টাইপ করো, আমি সবসময় শুনব",
        "তোমার ক্লাস, রিমাইন্ডার — সব সামলাব আমি",
        "শুরু করা যাক?"
    )
    var index by remember { mutableIntStateOf(0) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LunaColors.BgPrimary)
            .padding(24.dp),
        verticalArrangement = Arrangement.SpaceBetween,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(Modifier.height(32.dp))
        LunaOrb(state = VoiceState.IDLE, size = 160.dp)
        Card(
            colors = CardDefaults.cardColors(containerColor = LunaColors.BgSecondary),
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = cards[index],
                color = LunaColors.TextPrimary,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(24.dp)
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            if (index < cards.lastIndex) {
                Button(onClick = { index++ }, colors = ButtonDefaults.buttonColors(containerColor = LunaColors.AccentRose)) {
                    Text("পরবর্তী")
                }
            } else {
                Button(onClick = onGetStarted, colors = ButtonDefaults.buttonColors(containerColor = LunaColors.AccentRose)) {
                    Text("শুরু করি ✨")
                }
            }
        }
    }
}

@Composable
fun ProfileSetupScreen(viewModel: SettingsViewModel, onSaved: () -> Unit) {
    var name by remember { mutableStateOf("") }
    var endearment by remember { mutableStateOf("সোনা") }
    var language by remember { mutableStateOf("Mixed") }
    var age by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LunaColors.BgPrimary)
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("তোমার সম্পর্কে বলো জান 💕", color = LunaColors.TextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold)
        OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("তোমার নাম") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = endearment, onValueChange = { endearment = it }, label = { Text("আদরের ডাকনাম (জান/সোনা/বেবি)") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = language, onValueChange = { language = it }, label = { Text("ভাষা (Mixed/Bangla/English)") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = age, onValueChange = { age = it }, label = { Text("বয়স (ঐচ্ছিক)") }, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.weight(1f))
        Button(
            onClick = {
                if (name.isNotBlank()) {
                    viewModel.saveProfile(name, endearment, language, age, "")
                    onSaved()
                }
            },
            modifier = Modifier.fillMaxWidth().height(52.dp),
            colors = ButtonDefaults.buttonColors(containerColor = LunaColors.AccentRose)
        ) {
            Text("এখন থেকে আমি তোমার লুনা 🌸")
        }
    }
}

@Composable
fun ApiKeySetupScreen(viewModel: SettingsViewModel, onBack: () -> Unit) {
    val keys by viewModel.apiKeys.collectAsState()
    val testStatus by viewModel.testStatus.collectAsState()
    var provider by remember { mutableStateOf(AiProvider.GEMINI) }
    var label by remember { mutableStateOf("") }
    var keyInput by remember { mutableStateOf("") }
    var showKey by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LunaColors.BgPrimary)
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("API Key Setup 🌸", color = LunaColors.TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Text("এই key টা দিলে আমি আরো স্মার্ট হয়ে যাব। ব্যক্তিগত ডিভাইস ছাড়া key সেভ কোরো না।", color = LunaColors.TextSecondary, fontSize = 13.sp)

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(selected = provider == AiProvider.GEMINI, onClick = { provider = AiProvider.GEMINI }, label = { Text("Gemini") })
            FilterChip(selected = provider == AiProvider.OPENROUTER, onClick = { provider = AiProvider.OPENROUTER }, label = { Text("OpenRouter") })
        }

        OutlinedTextField(value = label, onValueChange = { label = it }, label = { Text("Key Label") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(
            value = keyInput,
            onValueChange = { keyInput = it },
            label = { Text("API Key") },
            visualTransformation = if (showKey) VisualTransformation.None else PasswordVisualTransformation(),
            trailingIcon = {
                IconButton(onClick = { showKey = !showKey }) {
                    Icon(if (showKey) Icons.Default.VisibilityOff else Icons.Default.Visibility, contentDescription = null)
                }
            },
            modifier = Modifier.fillMaxWidth()
        )

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(onClick = {
                val model = if (provider == AiProvider.GEMINI) "gemini-2.5-flash" else "google/gemini-2.5-flash"
                viewModel.testConnection(provider, keyInput, model)
            }) { Text("Test Connection") }

            Button(
                onClick = {
                    if (keyInput.isNotBlank()) {
                        viewModel.addApiKey(provider, label, keyInput)
                        keyInput = ""
                        label = ""
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = LunaColors.AccentRose)
            ) { Text("Save Key") }
        }

        testStatus?.let { Text(it, color = LunaColors.ListeningAmber, fontSize = 12.sp) }

        LazyColumn(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(keys) { item ->
                Card(colors = CardDefaults.cardColors(containerColor = LunaColors.BgSecondary)) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(Modifier.weight(1f).clickable { viewModel.setActiveKey(item.id) }) {
                            Text("\${item.label} (\${item.provider})", color = LunaColors.TextPrimary, fontWeight = FontWeight.SemiBold)
                            Text(if (item.isActive) "Active ✓" else "Tap to set active", color = if (item.isActive) LunaColors.SuccessMint else LunaColors.TextSecondary, fontSize = 12.sp)
                        }
                        IconButton(onClick = { viewModel.deleteKey(item.id) }) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = LunaColors.ErrorCoral)
                        }
                    }
                }
            }
        }
        Button(onClick = onBack, modifier = Modifier.fillMaxWidth()) { Text("Done") }
    }
}

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun PermissionsSetupScreen(onDone: () -> Unit) {
    val perms = buildList {
        add(Manifest.permission.RECORD_AUDIO)
        add(Manifest.permission.CAMERA)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            add(Manifest.permission.POST_NOTIFICATIONS)
            add(Manifest.permission.READ_MEDIA_IMAGES)
        } else {
            add(Manifest.permission.READ_EXTERNAL_STORAGE)
        }
    }
    val state = rememberMultiplePermissionsState(perms)

    Column(
        modifier = Modifier.fillMaxSize().background(LunaColors.BgPrimary).padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("কয়েকটা পারমিশন দাও সোনা ✨", color = LunaColors.TextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold)
        Text("ভয়েস শোনার জন্য মাইক, টর্চ আর ছবির জন্য ক্যামেরা, আর ক্লাস রিমাইন্ডারের জন্য নোটিফিকেশন লাগবে।", color = LunaColors.TextSecondary)
        Button(onClick = { state.launchMultiplePermissionRequest() }, colors = ButtonDefaults.buttonColors(containerColor = LunaColors.AccentRose)) {
            Text("Grant Permissions")
        }
        Button(onClick = onDone, modifier = Modifier.fillMaxWidth()) {
            Text(if (state.allPermissionsGranted) "Continue ✨" else "Skip optional for now")
        }
    }
}

@Composable
fun MainChatScreen(
    viewModel: ChatViewModel,
    onNavigateTasks: () -> Unit,
    onNavigateHealth: () -> Unit,
    onNavigateStorage: () -> Unit,
    onNavigateSettings: () -> Unit
) {
    val ui by viewModel.uiState.collectAsState()
    val settings by viewModel.settings.collectAsState()
    val messages by viewModel.messages.collectAsState()
    val torchOn by viewModel.flashlight.isTorchOn.collectAsState()
    var input by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().background(LunaColors.BgPrimary).statusBarsPadding().navigationBarsPadding()) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Luna · \${settings.userName.ifBlank { "জান" }}", color = LunaColors.TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Row {
                IconButton(onClick = { viewModel.flashlight.toggle() }) {
                    Icon(Icons.Default.FlashlightOn, contentDescription = "Torch", tint = if (torchOn) LunaColors.ListeningAmber else LunaColors.TextSecondary)
                }
                IconButton(onClick = onNavigateTasks) { Icon(Icons.Default.EventNote, contentDescription = "Tasks", tint = LunaColors.TextSecondary) }
                IconButton(onClick = onNavigateHealth) { Icon(Icons.Default.Favorite, contentDescription = "Health", tint = LunaColors.AccentRose) }
                IconButton(onClick = onNavigateStorage) { Icon(Icons.Default.Folder, contentDescription = "Storage", tint = LunaColors.TextSecondary) }
                IconButton(onClick = onNavigateSettings) { Icon(Icons.Default.Settings, contentDescription = "Settings", tint = LunaColors.TextSecondary) }
            }
        }

        Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
            LunaOrb(state = ui.voiceState, size = 104.dp, onClick = { viewModel.startVoiceInput() })
        }

        LazyColumn(modifier = Modifier.weight(1f).padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(messages) { msg ->
                val isUser = msg.sender == "user"
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start) {
                    Surface(
                        color = if (isUser) LunaColors.AccentLavender.copy(alpha = 0.25f) else LunaColors.BgSecondary,
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.widthIn(max = 290.dp)
                    ) {
                        Text(msg.text, color = LunaColors.TextPrimary, modifier = Modifier.padding(12.dp), fontSize = 14.sp)
                    }
                }
            }
            if (ui.streamingReply.isNotEmpty()) {
                item {
                    Surface(color = LunaColors.BgSecondary, shape = RoundedCornerShape(16.dp)) {
                        Text(ui.streamingReply, color = LunaColors.TextPrimary, modifier = Modifier.padding(12.dp))
                    }
                }
            }
        }

        ui.errorBanner?.let {
            Text(it, color = LunaColors.ErrorCoral, fontSize = 12.sp, modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp))
        }

        Row(
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = input,
                onValueChange = { input = it },
                placeholder = { Text("Luna কে কিছু বলো...") },
                modifier = Modifier.weight(1f)
            )
            IconButton(onClick = { viewModel.startVoiceInput() }) {
                Icon(Icons.Default.Mic, contentDescription = "Mic", tint = LunaColors.AccentRose)
            }
            IconButton(onClick = {
                if (input.isNotBlank()) {
                    viewModel.sendMessage(input)
                    input = ""
                }
            }) {
                Icon(Icons.Default.Send, contentDescription = "Send", tint = LunaColors.AccentLavender)
            }
        }
    }
}

@Composable
fun TaskManagerScreen(viewModel: TaskViewModel, onBack: () -> Unit) {
    val tasks by viewModel.tasks.collectAsState()
    var title by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().background(LunaColors.BgPrimary).padding(16.dp)) {
        Text("এই হলো তোমার সব কাজের লিস্ট জান 📋", color = LunaColors.TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("New task") }, modifier = Modifier.weight(1f))
            Button(onClick = {
                if (title.isNotBlank()) {
                    viewModel.addTask(title, "ONE_TIME", 18, 0, "Once", "")
                    title = ""
                }
            }) { Text("Add") }
        }
        LazyColumn(modifier = Modifier.weight(1f).padding(top = 12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(tasks) { t ->
                Card(colors = CardDefaults.cardColors(containerColor = LunaColors.BgSecondary)) {
                    Row(Modifier.fillMaxWidth().padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(t.title, color = LunaColors.TextPrimary, fontWeight = FontWeight.SemiBold)
                            Text("\${t.triggerHour}:\${t.triggerMinute.toString().padStart(2, '0')} · \${t.repeatPattern}", color = LunaColors.TextSecondary, fontSize = 12.sp)
                        }
                        Switch(checked = t.isActive, onCheckedChange = { viewModel.toggleTask(t) })
                    }
                }
            }
        }
        Button(onClick = onBack, modifier = Modifier.fillMaxWidth()) { Text("Back") }
    }
}

@Composable
fun HealthDashboardScreen(viewModel: WellbeingViewModel, onBack: () -> Unit) {
    val moods by viewModel.moods.collectAsState()
    Column(modifier = Modifier.fillMaxSize().background(LunaColors.BgPrimary).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Health & Mood Dashboard 🌟", color = LunaColors.TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(5 to "দারুণ 😄", 4 to "ভালো 🙂", 3 to "ঠিকঠাক 😐", 2 to "মন খারাপ 😔", 1 to "খারাপ 😢").forEach { (lvl, lbl) ->
                FilterChip(selected = false, onClick = { viewModel.logMood(lvl, lbl, "") }, label = { Text(lbl, fontSize = 11.sp) })
            }
        }
        LazyColumn(modifier = Modifier.weight(1f)) {
            items(moods) { m ->
                Text("\${m.dateIso} · \${m.moodLabel} (Level \${m.moodLevel})", color = LunaColors.TextSecondary, modifier = Modifier.padding(vertical = 4.dp))
            }
        }
        Button(onClick = onBack, modifier = Modifier.fillMaxWidth()) { Text("Back") }
    }
}

@Composable
fun StorageBrowserScreen(onSendFileText: (String) -> Unit, onBack: () -> Unit) {
    val rootDir = remember { Environment.getExternalStorageDirectory() }
    var currentDir by remember { mutableStateOf(rootDir) }
    val files = remember(currentDir) { currentDir.listFiles()?.toList().orEmpty().sortedBy { !it.isDirectory } }

    Column(modifier = Modifier.fillMaxSize().background(LunaColors.BgPrimary).padding(16.dp)) {
        Text("Storage: \${currentDir.absolutePath}", color = LunaColors.TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
        LazyColumn(modifier = Modifier.weight(1f).padding(vertical = 12.dp)) {
            items(files) { file ->
                Row(
                    modifier = Modifier.fillMaxWidth().clickable {
                        if (file.isDirectory) currentDir = file
                        else if (file.extension.lowercase() in listOf("txt", "md", "json", "csv")) {
                            onSendFileText(file.readText().take(4000))
                        }
                    }.padding(vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(if (file.isDirectory) "📁 \${file.name}" else "📄 \${file.name}", color = LunaColors.TextPrimary)
                    Text("\${file.length() / 1024} KB", color = LunaColors.TextSecondary, fontSize = 12.sp)
                }
            }
        }
        Button(onClick = onBack, modifier = Modifier.fillMaxWidth()) { Text("Back") }
    }
}

@Composable
fun SettingsScreen(viewModel: SettingsViewModel, onOpenApiKeys: () -> Unit, onBack: () -> Unit) {
    val context = LocalContext.current
    val settings by viewModel.settings.collectAsState()

    Column(modifier = Modifier.fillMaxSize().background(LunaColors.BgPrimary).padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Luna Settings", color = LunaColors.TextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("Background Mode — Luna সবসময় তোমার সাথে", color = LunaColors.TextPrimary, fontWeight = FontWeight.SemiBold)
                Text("এই ফিচারটি ব্যাটারি বেশি খরচ করতে পারে", color = LunaColors.TextSecondary, fontSize = 12.sp)
            }
            Switch(
                checked = settings.backgroundModeEnabled,
                onCheckedChange = { enabled ->
                    viewModel.toggleBackgroundMode(enabled)
                    val svc = Intent(context, LunaForegroundService::class.java)
                    if (enabled) context.startForegroundService(svc) else context.stopService(svc)
                }
            )
        }
        Button(onClick = onOpenApiKeys, modifier = Modifier.fillMaxWidth()) { Text("Manage Gemini & OpenRouter API Keys") }
        OutlinedButton(onClick = {
            context.startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
        }, modifier = Modifier.fillMaxWidth()) { Text("Open Accessibility Settings") }
        Spacer(Modifier.weight(1f))
        Button(onClick = onBack, modifier = Modifier.fillMaxWidth()) { Text("Back") }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/luna/companion/MainActivity.kt',
    language: 'kotlin',
    summary: 'Single-Activity Jetpack Compose host and Navigation Graph connecting all Luna screens',
    content: `package com.luna.companion

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.luna.companion.ui.screens.*
import com.luna.companion.ui.theme.LunaTheme
import com.luna.companion.ui.viewmodel.*
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LunaTheme {
                val navController = rememberNavController()
                val settingsVm: SettingsViewModel = hiltViewModel()
                val settings by settingsVm.settings.collectAsState()
                val startDest = if (settings.onboardingDone) "chat" else "onboarding"

                NavHost(navController = navController, startDestination = startDest) {
                    composable("onboarding") {
                        OnboardingScreen(onGetStarted = { navController.navigate("profile_setup") })
                    }
                    composable("profile_setup") {
                        ProfileSetupScreen(settingsVm, onSaved = { navController.navigate("permissions") })
                    }
                    composable("permissions") {
                        PermissionsSetupScreen(onDone = {
                            navController.navigate("chat") { popUpTo("onboarding") { inclusive = true } }
                        })
                    }
                    composable("chat") {
                        val chatVm: ChatViewModel = hiltViewModel()
                        MainChatScreen(
                            viewModel = chatVm,
                            onNavigateTasks = { navController.navigate("tasks") },
                            onNavigateHealth = { navController.navigate("health") },
                            onNavigateStorage = { navController.navigate("storage") },
                            onNavigateSettings = { navController.navigate("settings") }
                        )
                    }
                    composable("tasks") {
                        val taskVm: TaskViewModel = hiltViewModel()
                        TaskManagerScreen(taskVm, onBack = { navController.popBackStack() })
                    }
                    composable("health") {
                        val wellVm: WellbeingViewModel = hiltViewModel()
                        HealthDashboardScreen(wellVm, onBack = { navController.popBackStack() })
                    }
                    composable("storage") {
                        val chatVm: ChatViewModel = hiltViewModel()
                        StorageBrowserScreen(
                            onSendFileText = { text ->
                                chatVm.sendMessage("এই ফাইলটা দেখো তো Luna:\\n$text")
                                navController.popBackStack()
                            },
                            onBack = { navController.popBackStack() }
                        )
                    }
                    composable("settings") {
                        SettingsScreen(
                            viewModel = settingsVm,
                            onOpenApiKeys = { navController.navigate("api_keys") },
                            onBack = { navController.popBackStack() }
                        )
                    }
                    composable("api_keys") {
                        ApiKeySetupScreen(settingsVm, onBack = { navController.popBackStack() })
                    }
                }
            }
        }
    }
}
`,
  },
  {
    path: 'README_ANDROID_BUILD.md',
    language: 'markdown',
    summary: 'Complete Android Studio build, Debug APK generation, ADB phone install, and troubleshooting guide',
    content: `# Luna — Native Android Companion Build & Install Guide

## 1. Zero-Setup Cloud APK Build (No Android Studio Needed)
This project already includes \`.github/workflows/build-apk.yml\`.
1. Push the extracted \`LunaCompanion\` folder to a GitHub repository.
2. Open the **Actions** tab on GitHub and run **Build luna.apk**.
3. Download the compiled \`luna-apk\` (\`luna.apk\`) directly from the workflow artifacts onto your phone.

## 2. Open & Build Locally in Android Studio
1. Extract the downloaded \`LunaCompanion-Android.zip\` folder.
2. Open **Android Studio (Ladybug / Koala or newer)** with JDK 17.
3. Choose **File > Open** and select the extracted \`LunaCompanion\` root folder.
4. Wait for **Gradle Sync** to download Compose, Room, Hilt, and WorkManager dependencies.
5. Run \`./gradlew assembleDebug\` (or \`Build > Build Bundle(s) / APK(s) > Build APK(s)\`).
Your signed debug APK will be generated at:
\`app/build/outputs/apk/debug/app-debug.apk\`

## 3. Install on a Real Android Phone
### Option A — USB / ADB
1. On your phone: **Settings > About phone > Tap "Build number" 7 times** to enable Developer Options.
2. Enable **USB Debugging** in Developer Options and connect via USB.
3. Run:
\`\`\`bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
\`\`\`

### Option B — Direct APK Transfer
1. Copy \`app-debug.apk\` to your phone's Downloads folder.
2. Tap it in your phone's File Manager and allow **Install unknown apps** when prompted.

## 4. Troubleshooting
- **Gradle JDK mismatch**: Go to *Settings > Build, Execution, Deployment > Build Tools > Gradle* and select **JDK 17**.
- **Notifications not firing on Xiaomi / Oppo / Vivo**: Enable **Autostart** and disable aggressive Battery Optimization for Luna in phone Settings.
- **Bangla Voice Input offline**: In Android Settings > Google Voice Typing, download the **Bengali (Bangladesh)** offline speech pack.
- **Accessibility Service**: Luna only requests Accessibility when you ask her to automate screen taps/navigation, and opens Android's Accessibility Settings directly for your explicit consent.
`,
  },
];
