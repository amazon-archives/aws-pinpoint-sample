/*
* Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
* Licensed under the Amazon Software License (the "License").
* You may not use this file except in compliance with the License.
* A copy of the License is located at
*
*   http://aws.amazon.com/asl/
*
* or in the "license" file accompanying this file. This file is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied.
* See the License for the specific language governing permissions and limitations
* under the License.
*/
package com.pinpointsample;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;

import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.support.v4.app.NotificationCompat;

import android.os.Bundle;
import android.util.Log;
import com.google.android.gms.gcm.GcmListenerService;

import com.amazonaws.mobile.AWSMobileClient;
import com.amazonaws.mobileconnectors.pinpoint.targeting.notification.NotificationClient;

import com.pinpointsample.MainActivity;
import com.pinpointsample.AWSMobileHubModule;

import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import org.json.JSONObject;

/** A service that listens to GCM notifications. */
public class AWSPushListenerService extends GcmListenerService {

    private static final String LOG_TAG = AWSPushListenerService.class.getSimpleName();

    /**
     * Helper method to extract SNS message from bundle.
     *
     * @param data bundle
     * @return message string from SNS push notification
     */
    public static String getMessage(Bundle data) {
        // If a push notification is sent as plain text, then the message appears in "default".
        // Otherwise it's in the "message" for JSON format.
        return data.containsKey("default") ? data.getString("default") : data.getString(
            "message", "");
    }

    /**
     * Called when message is received.
     *
     * @param from SenderID of the sender.
     * @param data Data bundle containing message data as key/value pairs. For Set of keys use
     * data.keySet().
     */
    @Override
    public void onMessageReceived(final String from, final Bundle data) {

        final String message = data.getString("pinpoint.notification.body");
        final String title = data.getString("pinpoint.notification.title");

        Log.d(LOG_TAG, "From: " + from);
        Log.d(LOG_TAG, "Message: " + message);
        Log.d(LOG_TAG, "Title: " + title);

        Context applicationContext = getApplicationContext();
        AWSMobileClient.initializeMobileClientIfNecessary(getApplicationContext());

        final NotificationClient notificationClient = AWSMobileClient
            .defaultMobileClient()
            .getPinpointManager()
            .getNotificationClient();

        NotificationClient.CampaignPushResult pushResult =
            notificationClient.handleGCMCampaignPush(from, data, this.getClass());

				Handler handler = new Handler(Looper.getMainLooper());
        handler.post(new Runnable() {
            public void run() {
                // Construct and load our normal React JS code bundle
                ReactInstanceManager mReactInstanceManager = ((ReactApplication)getApplication()).getReactNativeHost().getReactInstanceManager();
                ReactContext context = mReactInstanceManager.getCurrentReactContext();
                // If it's constructed, send a notification
                if (context != null) {
                    sendNotification((ReactApplicationContext)context,title,message);
                } else {
                    // Otherwise wait for construction, then send the notification
                    mReactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                        public void onReactContextInitialized(ReactContext context) {
                          sendNotification((ReactApplicationContext)context,title,message);
                        }
                    });
                    if (!mReactInstanceManager.hasStartedCreatingInitialContext()) {
                        // Construct it in the background
                        mReactInstanceManager.createReactContextInBackground();
                    }
                }
            }
        });
    }

    //This method is generating a notification and displaying the notification
    private void sendNotification(ReactApplicationContext context, String title, String message) {

    		if (AWSMobileHubModule.isInForeground()) {
            context
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("notification","{\"title\":\""+title+"\",\"message\":\""+message+"\"}");
        } else {
		      Intent intent = new Intent(this, MainActivity.class);
		      intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
		      int requestCode = 0;
		      PendingIntent pendingIntent = PendingIntent.getActivity(this, requestCode, intent, PendingIntent.FLAG_ONE_SHOT);
		      Uri sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
		      NotificationCompat.Builder noBuilder = new NotificationCompat.Builder(this)
		              .setSmallIcon(context.getApplicationInfo().icon)
		              .setContentTitle(title)
		              .setContentText(message)
		              .setAutoCancel(true)
		              .setContentIntent(pendingIntent);

		      NotificationManager notificationManager = (NotificationManager)getSystemService(Context.NOTIFICATION_SERVICE);
		      notificationManager.notify(0, noBuilder.build()); //0 = ID of notification
        }
    }
}
