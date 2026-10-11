package com.techxodia.schoolkiosk

import android.app.Application
import android.util.Log

class SchoolKioskApp : Application() {

    override fun onCreate() {
        super.onCreate()
        Log.i(TAG, "SchoolKioskApp initialized with Zero-Persistence Memory Policy")
    }

    companion object {
        const val TAG = "SchoolKioskApp"
    }
}
