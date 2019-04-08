// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { Component, TouchableOpacity } from 'react';

// Add a reference to our native module
import AWSMobileHub from './AWSMobileHub'

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Picker,
  TouchableNativeFeedback,
  AsyncStorage,
  ActivityIndicator
} from 'react-native';

var PLANET_KEY = '@AmazonPinpoint:Planet',
	PLANETS = [ 'Earth', 'Tatooine', 'Naboo', 'Coorisant' ],
	WEATHER = {
		'Earth': 'Bright and Sunny',
		'Tatooine': 'Pretty Hot',
		'Naboo': 'Tropical',
		'Coorisant': 'Hot and Loud'
	},
	PRICES = {
		'Earth': '$200.00',
		'Tatooine': '$300.00',
		'Naboo': '$700.00',
		'Coorisant': '$500.00'
	};

export default class PinpointSample extends Component {

	constructor(props) {

		super(props);

		// Set the initial state
		this.state = {
			'planet': PLANETS[0],
			'price': PRICES[PLANETS[0]],
			'loading': true
		};

		// Configure the native module. These values can be
    // the same / copied from the com.amazonaws.mobile.AWSConfiguration
    // they can then be changed from here.
		AWSMobileHub.initializeApplication(
			// Cognito ID Pool
			'',
			// Pinpoint (previously Mobile Analytics) Application ID
			'',
			// GCM Sender ID
			'',
			// AWS Region
			''
		)
	}

	// React Native component lifecycle event
	componentDidMount() {
		this._loadInitialState().done();
	}

	// Set the initial state
	_loadInitialState = async () => {
		try {
			var value = await AsyncStorage.getItem(PLANET_KEY);
			if (value !== null) {
				this.setState({ 'planet': value });
				this.setState({ 'price': PRICES[value]});
				console.log('Recovered planet from disk: ', value);
			} else {
				console.log('Initialized with no pre-selected planet');
			}
		} catch (error) {
			console.error('AsyncStorage error: ', error.message);
		}

		this.setState({loading: !this.state.loading});
	}
	// run when the picker changes values
	// this will invoke our API Gateway method
	// and call our lambda function
	onPlanetChange = async (planet,index) => {
		this.setState({loading: true});
		console.log('change planet: ', planet);
		this.setState({ 'planet': planet });
		this._setCustomAttributes("Planet", planet);
		try {
			await AsyncStorage.setItem(PLANET_KEY, planet);
			console.log('Saved selection to disk: ', planet);
			this.setState({loading: false});
		} catch (error) {
			console.error('AsyncStorage error: ', error);
			this.setState({loading: false});
		}
	}

	// Makes an API Gateway call
	// using the native module and alerts
	// the results
	_apiCall = () => {
		this.setState({loading: true});
		var args = '?param=' + encodeURIComponent(WEATHER[this.state.planet]);
		AWSMobileHub.api(
			'GET',
			'/items',
			'',
			args)
			.then((response) => {
				var result = JSON.parse(response)
				var str = this.state.planet + ' \'s Weather is currently:\n' + result.queryStringParams.param.replace(/_/g, ' ');
				alert(str);
				this._setCustomAttributes('Weather Request',this.state.planet);
				this.setState({loading: false});
			})
			.catch((error) => {
				console.log(error);
				this.setState({loading: false});
			});
	}

	// This sets custom attributes in Pinpoint
	// allowing you to target specific segments
	_setCustomAttributes = (attr,value) => {
		AWSMobileHub.updateAttributes(attr,value);
	}

	// This creates a monetization event for display
	// within Amazon Pinpoint
	_getRich = () => {
		this.setState({ loading: true });
		AWSMobileHub.generateMonetizationEvent(PRICES[this.state.planet],this.state.planet)
			.then((event) => {
				console.log('monetization result: ', event);
				if ( event.result === 'ok' ) {
					alert('Purchase Complete, enjoy your trip to ' + this.state.planet);
					this._setCustomAttributes('Traveled',this.state.planet);
				} else {
					alert('Sorry, your purchase failed :(');
				}
				this.setState({ loading: false });
			})
			.catch((error) => {
				console.log(error);
				this.setState({ loading: false });
			})
	}


  render() {
    return (
      <View style={styles.container}>

		      <Text style={styles.baseText}>
		      	Which planet are you interested in traveling too?
		      </Text>

		      <Picker
		      	style={styles.picker}
		      	selectedValue={this.state.planet}
		      	onValueChange={this.onPlanetChange}
		      	mode="dialog" >
		      	<Picker.Item label="Earth" value="Earth" />
		      	<Picker.Item label="Tatooine" value="Tatooine" />
		      	<Picker.Item label="Naboo" value="Naboo" />
		      	<Picker.Item label="Coorisant" value="Coorisant" />
		      </Picker>

		      <TouchableNativeFeedback
		      	accessibilityComponentType="button"
		        accessibilityLabel="Purchase a Ride"
		        background={TouchableNativeFeedback.SelectableBackground()}
		        accessibilityTraits={['button']}
		        disabled={this.state.loading}
		        onPress={this._getRich}>

			      <View style={styles.button}>
				      <Text style={styles.clickable}>
				        {this.state.planet} Trip, {PRICES[this.state.planet]}
				      </Text>
			      </View>

		      </TouchableNativeFeedback>

		      <View style={styles.button}>
			      <Text style={styles.clickable} onPress={this._apiCall}>
			        Request {this.state.planet} Weather
			      </Text>
		      </View>

		      <ActivityIndicator
		        animating={this.state.loading}
		        style={[styles.centering, {height: 80}]}
		        size="large"
		      />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 20
  },
  button: {
  	padding: 10,
  	margin: 10,
  	backgroundColor: '#333333'

  },
  clickable: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    color: '#FEFEFE'
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  picker: {
    width: 150,
  },
  baseText: {
  	fontSize: 20,
  	textAlign: 'center'
  }
});

AppRegistry.registerComponent('PinpointSample', () => PinpointSample);
