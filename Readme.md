**This Repo is no longer valid with AWS Mobile Hub. To enable [Push Notifications](https://aws.github.io/aws-amplify/media/push_notifications_setup) in your React Native app use [AWS Amplify](https://github.com/aws/aws-amplify) with [Push Notifications](https://aws.github.io/aws-amplify/media/push_notifications_setup) and [Analytics with Amazon Pinpoint](https://aws.github.io/aws-amplify/media/analytics_guide#using-amazon-pinpoint).**

----

# AWS Pinpoint Sample App
A React Native mobile app that utilizes AWS Mobile Hub and AWS Native Mobile SDK. Just generate your Mobile Hub Package and drop it into the android package. The Configuration is update-able via JavaScript configuration using React Native Modules.

This app has an accompanying blog post located [here](https://aws.amazon.com/blogs/mobile/targeted-push-notifications-and-campaign-management-using-amazon-pinpoint-and-react-native/)

## Requirements
 -	Android SDK 16 / 23+ build tools ([Android Studio](https://developer.android.com/studio/install.html) provides the SDK and AVD (emulator) required to run and test the React Native app)
 -	[Node.js](https://nodejs.org)
 -	[React Native CLI](http://facebook.github.io/react-native/docs/getting-started.html)

# Setup Mobile Hub Project
Go to the AWS Mobile Hub console and create a new app. For this tutorial, enter the name *PinpointSample* then click *Create Project*.
In the list of features, choose **Cloud Logic** and then choose **Create new API**. Give the API a name *PinpointSampleApi* and a description, leave the defaults, and choose **Create API**.

Next, in the AWS Mobile Hub console, choose **User Engagement**, then choose **Enable engagement**, select **Android** and enter your Sender ID and Legacy API Keys for the Android Platform. Click Save changes then choose Integrate with your app. Next choose the Android tab, and then choose **Download package**.

Extract the *amazonaws* folder from Mobile Hub package archive to `android/app/src/main/java/com/amazonaws`.

For JavaScript to be able to update the AWS configuration dynamically, you will need to update the `AWSConfiguration.java` file and remote the `final` from the variables. Finally, you can update the configuration values in `index.android.js` with the values pre-populated in the AWSConfiguration class:

    AWSMobileHub.initializeApplication(
      // Cognito ID Pool
      '<<your-id-pool-id>>',
      // Pinpoint (previously Mobile Analytics) Application ID
      '<<app-id>>',
      // GCM Sender ID
      '<<your-sender-id>>',
      // AWS Region
      '<<your-region>>'
    )

# Running the Application
Once you've added your Mobile Hub package and updated the JavaScript configuration, connect a device and run:

    react-native run-android

You can use the included `logcat.sh` bash script (on mac or linux) to filter the log statements in the terminal:

    chmod +x logcat.sh
    ./logcat.sh

If you are on windows

    logcat

# License

This sample code is made available under the MIT-0 license. See the LICENSE file.
