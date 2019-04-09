// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
'use strict';

import {
	NativeModules,
	DeviceEventEmitter
} from 'react-native';

// This emits and displays a standard alert on a Push Notification
// that is sent from Pinpoint
DeviceEventEmitter.addListener("notification", function(data) {
	console.log('event: ', data);
	let notification = JSON.parse(data);
  	alert(notification.title + '\n\n' + notification.message);
});

module.exports = NativeModules.AWSMobileHub;
