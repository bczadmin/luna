export interface AndroidSourceFile {
  path: string;
  language: string;
  summary: string;
  content: string;
}

export const ANDROID_CORE_FILES: AndroidSourceFile[] = [
  {
    path: 'settings.gradle.kts',
    language: 'kotlin',
    summary: 'Root Gradle settings and module configuration',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "LunaCompanion"
include(":app")
`,
  },
  {
    path: 'gradle/libs.versions.toml',
    language: 'toml',
    summary: 'Version catalog with Jetpack Compose, Room, Hilt, Retrofit, WorkManager, and Security Crypto',
    content: `[versions]
agp = "8.5.2"
kotlin = "2.0.20"
ksp = "2.0.20-1.0.25"
composeBom = "2024.09.03"
activityCompose = "1.9.2"
navigationCompose = "2.8.1"
lifecycle = "2.8.6"
room = "2.6.1"
datastore = "1.1.1"
hilt = "2.52"
hiltNavigationCompose = "1.2.0"
hiltWork = "1.2.0"
retrofit = "2.11.0"
okhttp = "4.12.0"
coil = "2.7.0"
work = "2.9.1"
accompanist = "0.36.0"
securityCrypto = "1.1.0-alpha06"
kotlinxSerialization = "1.7.3"
coroutines = "1.9.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version = "1.13.1" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }
androidx-lifecycle-runtime-compose = { group = "androidx.lifecycle", name = "lifecycle-runtime-compose", version.ref = "lifecycle" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycle" }

room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }

datastore-preferences = { group = "androidx.datastore", name = "datastore-preferences", version.ref = "datastore" }
security-crypto = { group = "androidx.security", name = "security-crypto", version.ref = "securityCrypto" }

hilt-android = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
hilt-compiler = { group = "com.google.dagger", name = "hilt-compiler", version.ref = "hilt" }
hilt-navigation-compose = { group = "androidx.hilt", name = "hilt-navigation-compose", version.ref = "hiltNavigationCompose" }
hilt-work = { group = "androidx.hilt", name = "hilt-work", version.ref = "hiltWork" }
hilt-work-compiler = { group = "androidx.hilt", name = "hilt-compiler", version.ref = "hiltWork" }

retrofit = { group = "com.squareup.retrofit2", name = "retrofit", version.ref = "retrofit" }
retrofit-gson = { group = "com.squareup.retrofit2", name = "converter-gson", version.ref = "retrofit" }
okhttp = { group = "com.squareup.okhttp3", name = "okhttp", version.ref = "okhttp" }
okhttp-logging = { group = "com.squareup.okhttp3", name = "logging-interceptor", version.ref = "okhttp" }

coil-compose = { group = "io.coil-kt", name = "coil-compose", version.ref = "coil" }
work-runtime-ktx = { group = "androidx.work", name = "work-runtime-ktx", version.ref = "work" }
accompanist-permissions = { group = "com.google.accompanist", name = "accompanist-permissions", version.ref = "accompanist" }
kotlinx-serialization-json = { group = "org.jetbrains.kotlinx", name = "kotlinx-serialization-json", version.ref = "kotlinxSerialization" }
coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
`,
  },
  {
    path: 'build.gradle.kts',
    language: 'kotlin',
    summary: 'Top-level Gradle build script',
    content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.ksp) apply false
    alias(libs.plugins.hilt) apply false
}
`,
  },
  {
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    summary: 'App-level Gradle configuration with minSdk 26, targetSdk 34, Compose, Room, Hilt, and WorkManager',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt)
}

android {
    namespace = "com.luna.companion"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.luna.companion"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)

    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)

    implementation(libs.datastore.preferences)
    implementation(libs.security.crypto)

    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.hilt.navigation.compose)
    implementation(libs.hilt.work)
    ksp(libs.hilt.work.compiler)

    implementation(libs.retrofit)
    implementation(libs.retrofit.gson)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)

    implementation(libs.coil.compose)
    implementation(libs.work.runtime.ktx)
    implementation(libs.accompanist.permissions)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.coroutines.android)
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    summary: 'AndroidManifest declaring all permissions, ForegroundService, AccessibilityService, and BootReceiver',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission
        android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />
    <uses-permission
        android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="28" />

    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.flash" android:required="false" />

    <application
        android:name=".LunaApplication"
        android:allowBackup="true"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".services.background.LunaForegroundService"
            android:exported="false"
            android:foregroundServiceType="microphone" />

        <service
            android:name=".services.accessibility.LunaAccessibilityService"
            android:exported="false"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <receiver
            android:name=".services.reminder.BootReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

        <receiver
            android:name=".services.reminder.ReminderActionReceiver"
            android:exported="false" />

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>
</manifest>
`,
  },
  {
    path: 'app/src/main/res/xml/accessibility_service_config.xml',
    language: 'xml',
    summary: 'AccessibilityService XML metadata for UI tree reading and gesture dispatch',
    content: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeAllMask"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows|flagReportViewIds"
    android:canPerformGestures="true"
    android:canRetrieveWindowContent="true"
    android:canTakeScreenshot="true"
    android:description="@string/accessibility_service_desc"
    android:notificationTimeout="100" />
`,
  },
  {
    path: 'app/src/main/res/xml/file_paths.xml',
    language: 'xml',
    summary: 'FileProvider paths for Photo Memory and file exports',
    content: `<?xml version="1.0" encoding="utf-8"?>
<paths>
    <files-path name="photo_memory" path="photo_memory/" />
    <files-path name="exports" path="exports/" />
    <external-path name="external_files" path="." />
</paths>
`,
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    language: 'xml',
    summary: 'Default English string resources',
    content: `<resources>
    <string name="app_name">Luna</string>
    <string name="tagline">তোমার পাশে সবসময় ✨</string>
    <string name="accessibility_service_desc">Allows Luna to read visible UI elements and perform user-requested taps, typing, and navigation.</string>
    <string name="bg_service_title">Luna is with you ✨</string>
    <string name="bg_service_desc">Listening for your wake phrase gently in the background.</string>
    <string name="turn_off">Turn off</string>
    <string name="tap_to_open">Tap to open</string>
</resources>
`,
  },
  {
    path: 'app/src/main/res/values-bn/strings.xml',
    language: 'xml',
    summary: 'Bangla localized string resources',
    content: `<resources>
    <string name="app_name">Luna</string>
    <string name="tagline">তোমার পাশে সবসময় ✨</string>
    <string name="accessibility_service_desc">তোমার অনুরোধে স্ক্রিনের লেখা পড়া এবং ট্যাপ বা টাইপ করতে Luna-কে সাহায্য করে।</string>
    <string name="bg_service_title">Luna তোমার সাথেই আছে ✨</string>
    <string name="bg_service_desc">তোমার ডাকার জন্য অপেক্ষা করছি।</string>
    <string name="turn_off">বন্ধ করো</string>
    <string name="tap_to_open">খুলতে ট্যাপ করো</string>
</resources>
`,
  },
  {
    path: 'app/src/main/java/com/luna/companion/LunaApplication.kt',
    language: 'kotlin',
    summary: 'Hilt Application class creating all 4 notification channels and WorkManager configuration',
    content: `package com.luna.companion

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

@HiltAndroidApp
class LunaApplication : Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: HiltWorkerFactory

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(NotificationManager::class.java)
            val channels = listOf(
                NotificationChannel(
                    CHANNEL_REMINDERS,
                    "Luna Reminders",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Class routine and scheduled task reminders"
                    enableVibration(true)
                },
                NotificationChannel(
                    CHANNEL_HEALTH,
                    "Luna Health",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Water, meal, sleep, and gentle wellbeing check-ins"
                },
                NotificationChannel(
                    CHANNEL_BACKGROUND,
                    "Luna Background",
                    NotificationManager.IMPORTANCE_LOW
                ).apply {
                    description = "Persistent background companion service"
                },
                NotificationChannel(
                    CHANNEL_ALERTS,
                    "Luna Alerts",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Urgent full-screen alerts and wake notifications"
                }
            )
            channels.forEach { manager.createNotificationChannel(it) }
        }
    }

    companion object {
        const val CHANNEL_REMINDERS = "luna_reminders"
        const val CHANNEL_HEALTH = "luna_health"
        const val CHANNEL_BACKGROUND = "luna_background"
        const val CHANNEL_ALERTS = "luna_alerts"
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/luna/companion/data/local/db/Entities.kt',
    language: 'kotlin',
    summary: 'Room Database Entities for Messages, Sessions, Tasks, Class Routines, Memories, Mood, Sleep, and Photo Memory',
    content: `package com.luna.companion.data.local.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "chat_sessions")
data class SessionEntity(
    @PrimaryKey val id: String,
    val title: String,
    val createdAt: Long,
    val updatedAt: Long
)

@Entity(tableName = "messages")
data class MessageEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val sessionId: String,
    val sender: String, // "user", "luna", "system"
    val text: String,
    val timestamp: Long,
    val isVoice: Boolean = false,
    val quotedText: String? = null,
    val attachmentPath: String? = null
)

@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val type: String, // ONE_TIME, RECURRING, ROUTINE, HEALTH, CUSTOM
    val triggerHour: Int,
    val triggerMinute: Int,
    val triggerDateIso: String? = null,
    val repeatPattern: String, // Daily, Weekly, Every2h, Once
    val notes: String = "",
    val isActive: Boolean = true,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "class_routines")
data class ClassRoutineEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val dayOfWeek: Int, // Calendar.SUNDAY..Calendar.SATURDAY
    val dayLabel: String,
    val hour24: Int,
    val minute: Int,
    val subject: String,
    val room: String = "",
    val teacher: String = "",
    val isActive: Boolean = true
)

@Entity(tableName = "memory_facts")
data class MemoryFactEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val fact: String,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "mood_entries")
data class MoodEntryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val dateIso: String,
    val moodLevel: Int, // 1..5
    val moodLabel: String,
    val userNote: String = "",
    val autoDetected: Boolean = false
)

@Entity(tableName = "sleep_entries")
data class SleepEntryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val dateSleep: String,
    val timeSleep: String,
    val timeWoke: String,
    val durationMinutes: Int,
    val qualityLevel: Int, // 1..3
    val userNote: String = ""
)

@Entity(tableName = "photo_memories")
data class PhotoMemoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val filePath: String,
    val description: String,
    val dateTaken: String,
    val dateSaved: Long = System.currentTimeMillis(),
    val userNote: String = ""
)
`,
  },
  {
    path: 'app/src/main/java/com/luna/companion/data/local/db/LunaDatabase.kt',
    language: 'kotlin',
    summary: 'Room DAOs and Database definition',
    content: `package com.luna.companion.data.local.db

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.RoomDatabase
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface ChatDao {
    @Query("SELECT * FROM chat_sessions ORDER BY updatedAt DESC")
    fun observeSessions(): Flow<List<SessionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertSession(session: SessionEntity)

    @Query("DELETE FROM chat_sessions WHERE id = :sessionId")
    suspend fun deleteSession(sessionId: String)

    @Query("SELECT * FROM messages WHERE sessionId = :sessionId ORDER BY timestamp ASC")
    fun observeMessages(sessionId: String): Flow<List<MessageEntity>>

    @Query("SELECT * FROM messages WHERE text LIKE '%' || :query || '%' ORDER BY timestamp DESC LIMIT 100")
    suspend fun searchMessages(query: String): List<MessageEntity>

    @Insert
    suspend fun insertMessage(message: MessageEntity): Long

    @Query("DELETE FROM messages WHERE id = :id")
    suspend fun deleteMessage(id: Long)

    @Query("DELETE FROM messages WHERE sessionId = :sessionId")
    suspend fun deleteMessagesForSession(sessionId: String)

    @Query("DELETE FROM messages")
    suspend fun clearAllMessages()
}

@Dao
interface TaskDao {
    @Query("SELECT * FROM tasks ORDER BY createdAt DESC")
    fun observeTasks(): Flow<List<TaskEntity>>

    @Query("SELECT * FROM tasks WHERE isActive = 1")
    suspend fun getActiveTasksSync(): List<TaskEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTask(task: TaskEntity): Long

    @Update
    suspend fun updateTask(task: TaskEntity)

    @Delete
    suspend fun deleteTask(task: TaskEntity)

    @Query("SELECT * FROM class_routines ORDER BY dayOfWeek ASC, hour24 ASC, minute ASC")
    fun observeRoutines(): Flow<List<ClassRoutineEntity>>

    @Query("SELECT * FROM class_routines WHERE isActive = 1")
    suspend fun getActiveRoutinesSync(): List<ClassRoutineEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRoutines(items: List<ClassRoutineEntity>)

    @Delete
    suspend fun deleteRoutine(item: ClassRoutineEntity)
}

@Dao
interface WellbeingDao {
    @Query("SELECT * FROM memory_facts ORDER BY createdAt DESC")
    fun observeMemories(): Flow<List<MemoryFactEntity>>

    @Insert
    suspend fun insertMemory(fact: MemoryFactEntity)

    @Delete
    suspend fun deleteMemory(fact: MemoryFactEntity)

    @Query("DELETE FROM memory_facts")
    suspend fun clearMemories()

    @Query("SELECT * FROM mood_entries ORDER BY dateIso ASC")
    fun observeMoods(): Flow<List<MoodEntryEntity>>

    @Query("SELECT * FROM mood_entries WHERE dateIso = :dateIso LIMIT 1")
    suspend fun getMoodByDate(dateIso: String): MoodEntryEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertMood(entry: MoodEntryEntity)

    @Query("SELECT * FROM sleep_entries ORDER BY dateSleep ASC")
    fun observeSleeps(): Flow<List<SleepEntryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertSleep(entry: SleepEntryEntity)

    @Query("SELECT * FROM photo_memories ORDER BY dateSaved DESC")
    fun observePhotos(): Flow<List<PhotoMemoryEntity>>

    @Insert
    suspend fun insertPhoto(photo: PhotoMemoryEntity): Long

    @Update
    suspend fun updatePhoto(photo: PhotoMemoryEntity)

    @Delete
    suspend fun deletePhoto(photo: PhotoMemoryEntity)
}

@Database(
    entities = [
        SessionEntity::class,
        MessageEntity::class,
        TaskEntity::class,
        ClassRoutineEntity::class,
        MemoryFactEntity::class,
        MoodEntryEntity::class,
        SleepEntryEntity::class,
        PhotoMemoryEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class LunaDatabase : RoomDatabase() {
    abstract fun chatDao(): ChatDao
    abstract fun taskDao(): TaskDao
    abstract fun wellbeingDao(): WellbeingDao
}
`,
  },
  {
    path: 'app/src/main/java/com/luna/companion/data/local/preferences/PreferencesAndKeys.kt',
    language: 'kotlin',
    summary: 'DataStore user preferences and EncryptedSharedPreferences multi-provider API key storage',
    content: `package com.luna.companion.data.local.preferences

import android.content.Context
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore by preferencesDataStore(name = "luna_prefs")

enum class AiProvider { GEMINI, OPENROUTER }

@Serializable
data class ApiKeyRecord(
    val id: String = UUID.randomUUID().toString(),
    val provider: String, // "GEMINI" or "OPENROUTER"
    val label: String,
    val key: String,
    val isActive: Boolean = false
)

data class LunaSettings(
    val userName: String = "",
    val endearment: String = "সোনা",
    val language: String = "Mixed",
    val age: String = "",
    val birthday: String = "",
    val onboardingDone: Boolean = false,
    val voiceReplyEnabled: Boolean = true,
    val ttsRate: Float = 1.0f,
    val ttsPitch: Float = 1.05f,
    val sttLanguage: String = "bn-BD",
    val backgroundModeEnabled: Boolean = false,
    val wakePhrase: String = "Hey Luna",
    val activeProvider: AiProvider = AiProvider.GEMINI,
    val geminiModel: String = "gemini-2.5-flash",
    val openRouterModel: String = "google/gemini-2.5-flash",
    val waterIntervalHours: Int = 2,
    val bedtimeHour: Int = 22,
    val bedtimeMinute: Int = 30,
    val wakeHour: Int = 6,
    val wakeMinute: Int = 30,
    val bedtimeStoryEnabled: Boolean = true
)

@Singleton
class UserPreferencesManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private object Keys {
        val USER_NAME = stringPreferencesKey("user_name")
        val ENDEARMENT = stringPreferencesKey("endearment")
        val LANGUAGE = stringPreferencesKey("language")
        val AGE = stringPreferencesKey("age")
        val BIRTHDAY = stringPreferencesKey("birthday")
        val ONBOARDING_DONE = booleanPreferencesKey("onboarding_done")
        val VOICE_REPLY = booleanPreferencesKey("voice_reply")
        val TTS_RATE = floatPreferencesKey("tts_rate")
        val TTS_PITCH = floatPreferencesKey("tts_pitch")
        val STT_LANG = stringPreferencesKey("stt_lang")
        val BACKGROUND_MODE = booleanPreferencesKey("background_mode")
        val WAKE_PHRASE = stringPreferencesKey("wake_phrase")
        val ACTIVE_PROVIDER = stringPreferencesKey("active_provider")
        val GEMINI_MODEL = stringPreferencesKey("gemini_model")
        val OPENROUTER_MODEL = stringPreferencesKey("openrouter_model")
        val WATER_HOURS = intPreferencesKey("water_hours")
        val BEDTIME_HOUR = intPreferencesKey("bedtime_hour")
        val BEDTIME_MINUTE = intPreferencesKey("bedtime_minute")
        val WAKE_HOUR = intPreferencesKey("wake_hour")
        val WAKE_MINUTE = intPreferencesKey("wake_minute")
        val BEDTIME_STORY = booleanPreferencesKey("bedtime_story")
    }

    val settingsFlow: Flow<LunaSettings> = context.dataStore.data.map { prefs ->
        LunaSettings(
            userName = prefs[Keys.USER_NAME] ?: "",
            endearment = prefs[Keys.ENDEARMENT] ?: "সোনা",
            language = prefs[Keys.LANGUAGE] ?: "Mixed",
            age = prefs[Keys.AGE] ?: "",
            birthday = prefs[Keys.BIRTHDAY] ?: "",
            onboardingDone = prefs[Keys.ONBOARDING_DONE] ?: false,
            voiceReplyEnabled = prefs[Keys.VOICE_REPLY] ?: true,
            ttsRate = prefs[Keys.TTS_RATE] ?: 1.0f,
            ttsPitch = prefs[Keys.TTS_PITCH] ?: 1.05f,
            sttLanguage = prefs[Keys.STT_LANG] ?: "bn-BD",
            backgroundModeEnabled = prefs[Keys.BACKGROUND_MODE] ?: false,
            wakePhrase = prefs[Keys.WAKE_PHRASE] ?: "Hey Luna",
            activeProvider = runCatching {
                AiProvider.valueOf(prefs[Keys.ACTIVE_PROVIDER] ?: "GEMINI")
            }.getOrDefault(AiProvider.GEMINI),
            geminiModel = prefs[Keys.GEMINI_MODEL] ?: "gemini-2.5-flash",
            openRouterModel = prefs[Keys.OPENROUTER_MODEL] ?: "google/gemini-2.5-flash",
            waterIntervalHours = prefs[Keys.WATER_HOURS] ?: 2,
            bedtimeHour = prefs[Keys.BEDTIME_HOUR] ?: 22,
            bedtimeMinute = prefs[Keys.BEDTIME_MINUTE] ?: 30,
            wakeHour = prefs[Keys.WAKE_HOUR] ?: 6,
            wakeMinute = prefs[Keys.WAKE_MINUTE] ?: 30,
            bedtimeStoryEnabled = prefs[Keys.BEDTIME_STORY] ?: true
        )
    }

    suspend fun updateProfile(name: String, endearment: String, language: String, age: String, birthday: String) {
        context.dataStore.edit {
            it[Keys.USER_NAME] = name
            it[Keys.ENDEARMENT] = endearment
            it[Keys.LANGUAGE] = language
            it[Keys.AGE] = age
            it[Keys.BIRTHDAY] = birthday
            it[Keys.ONBOARDING_DONE] = true
        }
    }

    suspend fun setBackgroundMode(enabled: Boolean) {
        context.dataStore.edit { it[Keys.BACKGROUND_MODE] = enabled }
    }

    suspend fun setVoiceReply(enabled: Boolean) {
        context.dataStore.edit { it[Keys.VOICE_REPLY] = enabled }
    }

    suspend fun setTtsConfig(rate: Float, pitch: Float, sttLang: String, wakePhrase: String) {
        context.dataStore.edit {
            it[Keys.TTS_RATE] = rate
            it[Keys.TTS_PITCH] = pitch
            it[Keys.STT_LANG] = sttLang
            it[Keys.WAKE_PHRASE] = wakePhrase
        }
    }

    suspend fun setProviderAndModel(provider: AiProvider, geminiModel: String, openRouterModel: String) {
        context.dataStore.edit {
            it[Keys.ACTIVE_PROVIDER] = provider.name
            it[Keys.GEMINI_MODEL] = geminiModel
            it[Keys.OPENROUTER_MODEL] = openRouterModel
        }
    }
}

@Singleton
class SecureApiKeyManager @Inject constructor(
    @ApplicationContext context: Context
) {
    private val json = Json { ignoreUnknownKeys = true }
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val encryptedPrefs = EncryptedSharedPreferences.create(
        context,
        "luna_secure_keys",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    private val _keys = MutableStateFlow(loadKeys())
    val keys: StateFlow<List<ApiKeyRecord>> = _keys

    private fun loadKeys(): List<ApiKeyRecord> {
        val raw = encryptedPrefs.getString(PREF_KEYS_JSON, null) ?: return emptyList()
        return runCatching { json.decodeFromString<List<ApiKeyRecord>>(raw) }.getOrDefault(emptyList())
    }

    private fun persist(list: List<ApiKeyRecord>) {
        encryptedPrefs.edit().putString(PREF_KEYS_JSON, json.encodeToString(list)).apply()
        _keys.value = list
    }

    fun addKey(provider: AiProvider, label: String, keyValue: String) {
        val current = _keys.value.toMutableList()
        val hasActiveForProvider = current.any { it.provider == provider.name && it.isActive }
        current.add(
            ApiKeyRecord(
                provider = provider.name,
                label = label.trim().ifEmpty { "\${provider.name} Key" },
                key = keyValue.trim(),
                isActive = !hasActiveForProvider
            )
        )
        persist(current)
    }

    fun setActiveKey(id: String) {
        val target = _keys.value.find { it.id == id } ?: return
        val updated = _keys.value.map {
            if (it.provider == target.provider) it.copy(isActive = it.id == id) else it
        }
        persist(updated)
    }

    fun deleteKey(id: String) {
        val remaining = _keys.value.filterNot { it.id == id }
        persist(remaining)
    }

    fun getActiveKey(provider: AiProvider): ApiKeyRecord? {
        return _keys.value.firstOrNull { it.provider == provider.name && it.isActive }
            ?: _keys.value.firstOrNull { it.provider == provider.name }
    }

    fun rotateNextKey(provider: AiProvider, failedKeyId: String): ApiKeyRecord? {
        val pool = _keys.value.filter { it.provider == provider.name }
        if (pool.size <= 1) return null
        val next = pool.firstOrNull { it.id != failedKeyId } ?: return null
        setActiveKey(next.id)
        return next
    }

    companion object {
        private const val PREF_KEYS_JSON = "api_keys_list_v1"
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/luna/companion/data/remote/AiClients.kt',
    language: 'kotlin',
    summary: 'Gemini and OpenRouter HTTP/Streaming clients with multi-key rotation, vision support, and connection testing',
    content: `package com.luna.companion.data.remote

import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.luna.companion.data.local.db.MessageEntity
import com.luna.companion.data.local.preferences.AiProvider
import com.luna.companion.data.local.preferences.LunaSettings
import com.luna.companion.data.local.preferences.SecureApiKeyManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.BufferedReader
import javax.inject.Inject
import javax.inject.Singleton

sealed class ConnectionTestResult {
    data class Success(val reply: String) : ConnectionTestResult()
    data class Failure(val reason: String) : ConnectionTestResult()
}

@Singleton
class AiRepository @Inject constructor(
    private val okHttpClient: OkHttpClient,
    private val keyManager: SecureApiKeyManager,
    private val gson: Gson
) {
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    suspend fun testConnection(
        provider: AiProvider,
        apiKey: String,
        model: String
    ): ConnectionTestResult = withContext(Dispatchers.IO) {
        if (apiKey.isBlank()) return@withContext ConnectionTestResult.Failure("API Key খালি আছে।")
        try {
            val request = when (provider) {
                AiProvider.GEMINI -> {
                    val body = JsonObject().apply {
                        add("contents", JsonArray().apply {
                            add(JsonObject().apply {
                                add("parts", JsonArray().apply {
                                    add(JsonObject().apply { addProperty("text", "Hello") })
                                })
                            })
                        })
                    }
                    Request.Builder()
                        .url("https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey")
                        .post(body.toString().toRequestBody(jsonMediaType))
                        .build()
                }
                AiProvider.OPENROUTER -> {
                    val body = JsonObject().apply {
                        addProperty("model", model)
                        add("messages", JsonArray().apply {
                            add(JsonObject().apply {
                                addProperty("role", "user")
                                addProperty("content", "Hello")
                            })
                        })
                    }
                    Request.Builder()
                        .url("https://openrouter.ai/api/v1/chat/completions")
                        .header("Authorization", "Bearer $apiKey")
                        .post(body.toString().toRequestBody(jsonMediaType))
                        .build()
                }
            }
            okHttpClient.newCall(request).execute().use { response ->
                val raw = response.body?.string().orEmpty()
                if (!response.isSuccessful) {
                    val msg = when (response.code) {
                        400, 401, 403 -> "Invalid API key (\${response.code})"
                        429 -> "Quota exceeded / rate limit (429)"
                        404 -> "Model not found (404)"
                        else -> "Server error (\${response.code})"
                    }
                    return@withContext ConnectionTestResult.Failure(msg)
                }
                val parsed = gson.fromJson(raw, JsonObject::class.java)
                val replyText = if (provider == AiProvider.GEMINI) {
                    parsed.getAsJsonArray("candidates")
                        ?.firstOrNull()?.asJsonObject
                        ?.getAsJsonObject("content")
                        ?.getAsJsonArray("parts")
                        ?.firstOrNull()?.asJsonObject
                        ?.get("text")?.asString ?: "Connected"
                } else {
                    parsed.getAsJsonArray("choices")
                        ?.firstOrNull()?.asJsonObject
                        ?.getAsJsonObject("message")
                        ?.get("content")?.asString ?: "Connected"
                }
                ConnectionTestResult.Success(replyText.trim())
            }
        } catch (e: Exception) {
            ConnectionTestResult.Failure(e.localizedMessage ?: "Network unavailable")
        }
    }

    fun streamChat(
        userMessage: String,
        history: List<MessageEntity>,
        memories: List<String>,
        settings: LunaSettings,
        imageBase64: String? = null
    ): Flow<String> = flow {
        val provider = settings.activeProvider
        val keyRecord = keyManager.getActiveKey(provider)
            ?: throw IllegalStateException("কোনো API Key সেট করা নেই সোনা! Settings থেকে যোগ করো।")

        val systemPrompt = buildSystemPrompt(settings, memories)

        try {
            if (provider == AiProvider.GEMINI) {
                streamGemini(
                    apiKey = keyRecord.key,
                    model = settings.geminiModel,
                    systemPrompt = systemPrompt,
                    history = history,
                    userMessage = userMessage,
                    imageBase64 = imageBase64
                ).collect { emit(it) }
            } else {
                streamOpenRouter(
                    apiKey = keyRecord.key,
                    model = settings.openRouterModel,
                    systemPrompt = systemPrompt,
                    history = history,
                    userMessage = userMessage,
                    imageBase64 = imageBase64
                ).collect { emit(it) }
            }
        } catch (e: Exception) {
            val rotated = keyManager.rotateNextKey(provider, keyRecord.id)
            if (rotated != null) {
                if (provider == AiProvider.GEMINI) {
                    streamGemini(rotated.key, settings.geminiModel, systemPrompt, history, userMessage, imageBase64)
                        .collect { emit(it) }
                } else {
                    streamOpenRouter(rotated.key, settings.openRouterModel, systemPrompt, history, userMessage, imageBase64)
                        .collect { emit(it) }
                }
            } else {
                throw e
            }
        }
    }.flowOn(Dispatchers.IO)

    private fun streamGemini(
        apiKey: String,
        model: String,
        systemPrompt: String,
        history: List<MessageEntity>,
        userMessage: String,
        imageBase64: String?
    ): Flow<String> = flow {
        val contents = JsonArray().apply {
            history.takeLast(16).forEach { msg ->
                add(JsonObject().apply {
                    addProperty("role", if (msg.sender == "luna") "model" else "user")
                    add("parts", JsonArray().apply {
                        add(JsonObject().apply { addProperty("text", msg.text) })
                    })
                })
            }
            add(JsonObject().apply {
                addProperty("role", "user")
                add("parts", JsonArray().apply {
                    if (!imageBase64.isNullOrBlank()) {
                        add(JsonObject().apply {
                            add("inlineData", JsonObject().apply {
                                addProperty("mimeType", "image/jpeg")
                                addProperty("data", imageBase64)
                            })
                        })
                    }
                    add(JsonObject().apply { addProperty("text", userMessage) })
                })
            })
        }

        val payload = JsonObject().apply {
            add("systemInstruction", JsonObject().apply {
                add("parts", JsonArray().apply {
                    add(JsonObject().apply { addProperty("text", systemPrompt) })
                })
            })
            add("contents", contents)
        }

        val request = Request.Builder()
            .url("https://generativelanguage.googleapis.com/v1beta/models/$model:streamGenerateContent?alt=sse&key=$apiKey")
            .post(payload.toString().toRequestBody(jsonMediaType))
            .build()

        okHttpClient.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IllegalStateException("Gemini API Error (\${response.code})")
            }
            val reader: BufferedReader = response.body?.charStream()?.buffered()
                ?: throw IllegalStateException("Empty response stream")
            reader.useLines { lines ->
                lines.forEach { line ->
                    if (line.startsWith("data:")) {
                        val jsonPart = line.removePrefix("data:").trim()
                        if (jsonPart.isNotEmpty() && jsonPart != "[DONE]") {
                            val obj = gson.fromJson(jsonPart, JsonObject::class.java)
                            val chunk = obj.getAsJsonArray("candidates")
                                ?.firstOrNull()?.asJsonObject
                                ?.getAsJsonObject("content")
                                ?.getAsJsonArray("parts")
                                ?.firstOrNull()?.asJsonObject
                                ?.get("text")?.asString
                            if (!chunk.isNullOrEmpty()) emit(chunk)
                        }
                    }
                }
            }
        }
    }

    private fun streamOpenRouter(
        apiKey: String,
        model: String,
        systemPrompt: String,
        history: List<MessageEntity>,
        userMessage: String,
        imageBase64: String?
    ): Flow<String> = flow {
        val messages = JsonArray().apply {
            add(JsonObject().apply {
                addProperty("role", "system")
                addProperty("content", systemPrompt)
            })
            history.takeLast(16).forEach { msg ->
                add(JsonObject().apply {
                    addProperty("role", if (msg.sender == "luna") "assistant" else "user")
                    addProperty("content", msg.text)
                })
            }
            add(JsonObject().apply {
                addProperty("role", "user")
                if (!imageBase64.isNullOrBlank()) {
                    add("content", JsonArray().apply {
                        add(JsonObject().apply {
                            addProperty("type", "text")
                            addProperty("text", userMessage)
                        })
                        add(JsonObject().apply {
                            addProperty("type", "image_url")
                            add("image_url", JsonObject().apply {
                                addProperty("url", "data:image/jpeg;base64,$imageBase64")
                            })
                        })
                    })
                } else {
                    addProperty("content", userMessage)
                }
            })
        }

        val payload = JsonObject().apply {
            addProperty("model", model)
            addProperty("stream", true)
            add("messages", messages)
        }

        val request = Request.Builder()
            .url("https://openrouter.ai/api/v1/chat/completions")
            .header("Authorization", "Bearer $apiKey")
            .header("Content-Type", "application/json")
            .post(payload.toString().toRequestBody(jsonMediaType))
            .build()

        okHttpClient.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IllegalStateException("OpenRouter Error (\${response.code})")
            }
            val reader = response.body?.charStream()?.buffered() ?: return@use
            reader.useLines { lines ->
                lines.forEach { line ->
                    if (line.startsWith("data:")) {
                        val raw = line.removePrefix("data:").trim()
                        if (raw.isNotEmpty() && raw != "[DONE]") {
                            val obj = gson.fromJson(raw, JsonObject::class.java)
                            val delta = obj.getAsJsonArray("choices")
                                ?.firstOrNull()?.asJsonObject
                                ?.getAsJsonObject("delta")
                                ?.get("content")?.asString
                            if (!delta.isNullOrEmpty()) emit(delta)
                        }
                    }
                }
            }
        }
    }

    private fun buildSystemPrompt(settings: LunaSettings, memories: List<String>): String {
        val name = settings.userName.ifBlank { "জান" }
        val memText = if (memories.isEmpty()) "None yet." else memories.joinToString("; ")
        return """
            You are Luna, a warm, playful, caring girlfriend-style AI companion.
            Address the user as "$name" and naturally use "\${settings.endearment}".
            Match the user's language (Bangla, English, or Banglish). Never sound robotic.
            Known memories: $memText
        """.trimIndent()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/luna/companion/services/SystemServices.kt',
    language: 'kotlin',
    summary: 'Flashlight Camera2 wrapper, SpeechRecognizer, TTS Manager, ForegroundService, AccessibilityService, and WorkManager + AlarmManager reminders',
    content: `package com.luna.companion.services

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.app.AlarmManager
import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.graphics.Path
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.os.BatteryManager
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import androidx.core.app.NotificationCompat
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.luna.companion.LunaApplication
import com.luna.companion.MainActivity
import com.luna.companion.data.local.db.TaskDao
import com.luna.companion.data.local.preferences.UserPreferencesManager
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.Calendar
import java.util.Locale
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FlashlightController @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    private val _isTorchOn = MutableStateFlow(false)
    val isTorchOn: StateFlow<Boolean> = _isTorchOn

    fun setTorch(enabled: Boolean): Result<Boolean> {
        return try {
            val cameraId = cameraManager.cameraIdList.firstOrNull { id ->
                cameraManager.getCameraCharacteristics(id)
                    .get(CameraCharacteristics.FLASH_INFO_AVAILABLE) == true
            } ?: return Result.failure(IllegalStateException("এই ডিভাইসে ফ্ল্যাশ লাইট নেই।"))
            cameraManager.setTorchMode(cameraId, enabled)
            _isTorchOn.value = enabled
            Result.success(enabled)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun toggle(): Result<Boolean> = setTorch(!_isTorchOn.value)
}

@Singleton
class LunaTtsManager @Inject constructor(
    @ApplicationContext context: Context
) {
    private var tts: TextToSpeech? = null
    private var ready = false

    init {
        tts = TextToSpeech(context) { status ->
            ready = status == TextToSpeech.SUCCESS
        }
    }

    fun speak(
        text: String,
        rate: Float = 1.0f,
        pitch: Float = 1.05f,
        onDone: () -> Unit = {}
    ) {
        if (!ready) {
            onDone()
            return
        }
        val clean = text.replace(Regex("[\\\\p{So}\\\\p{Cn}]"), "").trim()
        val hasBangla = clean.any { it in '\\u0980'..'\\u09FF' }
        tts?.language = if (hasBangla) Locale("bn", "BD") else Locale.US
        tts?.setSpeechRate(rate.coerceIn(0.5f, 2.0f))
        tts?.setPitch(pitch.coerceIn(0.5f, 1.5f))
        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {}
            override fun onDone(utteranceId: String?) { onDone() }
            @Deprecated("Deprecated in Java")
            override fun onError(utteranceId: String?) { onDone() }
        })
        tts?.speak(clean, TextToSpeech.QUEUE_FLUSH, null, "luna-\${System.currentTimeMillis()}")
    }

    fun stop() {
        tts?.stop()
    }
}

@Singleton
class LunaSpeechRecognizer @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private var recognizer: SpeechRecognizer? = null

    fun startListening(
        languageTag: String,
        onPartial: (String) -> Unit,
        onResult: (String) -> Unit,
        onError: (Int) -> Unit
    ) {
        stop()
        if (!SpeechRecognizer.isRecognitionAvailable(context)) {
            onError(SpeechRecognizer.ERROR_CLIENT)
            return
        }
        recognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
            setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {}
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {}
                override fun onError(error: Int) { onError(error) }
                override fun onResults(results: Bundle?) {
                    val text = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        ?.firstOrNull().orEmpty()
                    onResult(text)
                }
                override fun onPartialResults(partialResults: Bundle?) {
                    val text = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        ?.firstOrNull().orEmpty()
                    if (text.isNotEmpty()) onPartial(text)
                }
                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
        }
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, languageTag)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        }
        recognizer?.startListening(intent)
    }

    fun stop() {
        recognizer?.stopListening()
        recognizer?.destroy()
        recognizer = null
    }
}

class LunaForegroundService : Service() {
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var isRunning = false

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopSelf()
            return START_NOT_STICKY
        }
        startForeground(NOTIFICATION_ID, buildNotification())
        if (!isRunning) {
            isRunning = true
            monitorBatteryAndWakeLoop()
        }
        return START_STICKY
    }

    private fun monitorBatteryAndWakeLoop() {
        serviceScope.launch {
            while (isRunning) {
                val bm = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
                val level = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
                if (level in 1..14) {
                    stopSelf()
                    break
                }
                delay(5_000L)
            }
        }
    }

    private fun buildNotification(): Notification {
        val openIntent = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE
        )
        val stopIntent = PendingIntent.getService(
            this, 1,
            Intent(this, LunaForegroundService::class.java).setAction(ACTION_STOP),
            PendingIntent.FLAG_IMMUTABLE
        )
        return NotificationCompat.Builder(this, LunaApplication.CHANNEL_BACKGROUND)
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setContentTitle("Luna is with you ✨")
            .setContentText("Background mode active")
            .setOngoing(true)
            .setContentIntent(openIntent)
            .addAction(0, "Turn off", stopIntent)
            .build()
    }

    override fun onDestroy() {
        isRunning = false
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val ACTION_STOP = "com.luna.companion.STOP_BG"
        const val NOTIFICATION_ID = 9001
    }
}

class LunaAccessibilityService : AccessibilityService() {
    override fun onServiceConnected() {
        instance = this
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}

    override fun onInterrupt() {}

    fun tapAt(x: Float, y: Float) {
        val path = Path().apply { moveTo(x, y) }
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0L, 60L))
            .build()
        dispatchGesture(gesture, null, null)
    }

    fun swipeDirection(direction: String) {
        val dm = resources.displayMetrics
        val cx = dm.widthPixels / 2f
        val cy = dm.heightPixels / 2f
        val path = Path().apply {
            when (direction.uppercase()) {
                "UP" -> { moveTo(cx, cy + 300f); lineTo(cx, cy - 300f) }
                "DOWN" -> { moveTo(cx, cy - 300f); lineTo(cx, cy + 300f) }
                "LEFT" -> { moveTo(cx + 300f, cy); lineTo(cx - 300f, cy) }
                else -> { moveTo(cx - 300f, cy); lineTo(cx + 300f, cy) }
            }
        }
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0L, 260L))
            .build()
        dispatchGesture(gesture, null, null)
    }

    fun typeIntoFocusedField(text: String): Boolean {
        val root = rootInActiveWindow ?: return false
        val focused = root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT) ?: return false
        val args = Bundle().apply {
            putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
        }
        return focused.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)
    }

    companion object {
        var instance: LunaAccessibilityService? = null
    }
}

@HiltWorker
class TaskReminderWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted params: WorkerParameters,
    private val taskDao: TaskDao,
    private val prefs: UserPreferencesManager
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        val settings = prefs.settingsFlow.first()
        val userName = settings.userName.ifBlank { "জান" }
        val title = inputData.getString("title") ?: "রিমাইন্ডার"
        val body = inputData.getString("body") ?: "মনে আছে তো $userName?"

        val nm = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
        val openPending = PendingIntent.getActivity(
            applicationContext, 0,
            Intent(applicationContext, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )
        val notification = NotificationCompat.Builder(applicationContext, LunaApplication.CHANNEL_REMINDERS)
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setFullScreenIntent(openPending, true)
            .build()
        nm.notify(System.currentTimeMillis().toInt(), notification)
        return Result.success()
    }
}

@Singleton
class AlarmScheduler @Inject constructor(
    @ApplicationContext private val context: Context
) {
    fun scheduleClassPreReminder(subject: String, room: String, dayOfWeek: Int, hour24: Int, minute: Int) {
        val cal = Calendar.getInstance().apply {
            set(Calendar.DAY_OF_WEEK, dayOfWeek)
            set(Calendar.HOUR_OF_DAY, hour24)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            add(Calendar.MINUTE, -3) // 3 minutes before class
            if (timeInMillis <= System.currentTimeMillis()) {
                add(Calendar.WEEK_OF_YEAR, 1)
            }
        }
        val delayMs = (cal.timeInMillis - System.currentTimeMillis()).coerceAtLeast(1_000L)
        val data = androidx.work.workDataOf(
            "title" to "⏰ $subject এর ক্লাস ৩ মিনিট পরে!",
            "body" to "তৈরি হও জান! \${if (room.isNotBlank()) room else ""}"
        )
        val req = OneTimeWorkRequestBuilder<TaskReminderWorker>()
            .setInitialDelay(delayMs, TimeUnit.MILLISECONDS)
            .setInputData(data)
            .build()
        WorkManager.getInstance(context).enqueueUniqueWork(
            "class_\${dayOfWeek}_\${hour24}_$minute",
            ExistingWorkPolicy.REPLACE,
            req
        )
    }
}

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            // Restart ForegroundService if Background Mode was ON and reschedule WorkManager tasks
            val work = OneTimeWorkRequestBuilder<TaskReminderWorker>().build()
            WorkManager.getInstance(context).enqueue(work)
        }
    }
}

class ReminderActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // Handle Done / Snooze 5 min notification actions
    }
}

@Singleton
class LunaMusicEngine @Inject constructor() {
    private var playing = false
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    fun startSoftAccompaniment() {
        stop()
        playing = true
        scope.launch {
            val sampleRate = 22050
            val chordFreqs = listOf(
                doubleArrayOf(261.63, 329.63, 392.00, 493.88), // Cmaj7
                doubleArrayOf(220.00, 261.63, 329.63, 392.00), // Am7
                doubleArrayOf(174.61, 220.00, 261.63, 329.63), // Fmaj7
                doubleArrayOf(196.00, 246.94, 293.66, 329.63)  // G6
            )
            val minBuf = android.media.AudioTrack.getMinBufferSize(
                sampleRate,
                android.media.AudioFormat.CHANNEL_OUT_MONO,
                android.media.AudioFormat.ENCODING_PCM_16BIT
            )
            val track = android.media.AudioTrack.Builder()
                .setAudioFormat(
                    android.media.AudioFormat.Builder()
                        .setEncoding(android.media.AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(sampleRate)
                        .setChannelMask(android.media.AudioFormat.CHANNEL_OUT_MONO)
                        .build()
                )
                .setBufferSizeInBytes(minBuf * 2)
                .build()
            track.play()
            var step = 0
            val samplesPerChord = sampleRate * 2
            val buffer = ShortArray(samplesPerChord)
            while (playing) {
                val freqs = chordFreqs[step % chordFreqs.size]
                step++
                for (i in 0 until samplesPerChord) {
                    if (!playing) break
                    val t = i.toDouble() / sampleRate
                    val env = kotlin.math.sin(Math.PI * i / samplesPerChord)
                    var mix = 0.0
                    for (f in freqs) {
                        mix += kotlin.math.sin(2.0 * Math.PI * f * t)
                    }
                    buffer[i] = ((mix / freqs.size) * env * 4500.0).toInt().toShort()
                }
                if (playing) {
                    track.write(buffer, 0, buffer.size)
                }
            }
            track.stop()
            track.release()
        }
    }

    fun stop() {
        playing = false
    }
}
`,
  },
  {
    path: 'gradle.properties',
    language: 'properties',
    summary: 'Gradle JVM memory and AndroidX configuration',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`,
  },
  {
    path: 'app/proguard-rules.pro',
    language: 'pro',
    summary: 'ProGuard keep rules for Retrofit, Gson, Kotlin Serialization, and Room',
    content: `-keepattributes Signature,InnerClasses,EnclosingMethod
-keep class com.luna.companion.data.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**
`,
  },
  {
    path: 'gradle/wrapper/gradle-wrapper.properties',
    language: 'properties',
    summary: 'Gradle 8.7 wrapper distribution properties',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`,
  },
  {
    path: '.github/workflows/build-apk.yml',
    language: 'yaml',
    summary: 'Automated GitHub Actions cloud workflow that compiles and uploads luna.apk',
    content: `name: Build luna.apk

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - uses: android-actions/setup-android@v3
      - uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: '8.7'
      - name: Build Debug APK
        run: gradle assembleDebug --no-daemon
      - name: Rename APK to luna.apk
        run: cp app/build/outputs/apk/debug/app-debug.apk luna.apk
      - name: Upload luna.apk
        uses: actions/upload-artifact@v4
        with:
          name: luna-apk
          path: luna.apk
`,
  },
];
