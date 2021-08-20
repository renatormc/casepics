import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CaseScreen from '../screens/case';
import HomeScreen from '../screens/home';
import NoteScreen from '../screens/note';
import { Pic } from '../types/interfaces';


export type RootNavigationParamsList = {
    Home: undefined, 
    Case: {
        caseName: string
    },
    Note: {
        pic: Pic
    },
};

const Stack = createStackNavigator<RootNavigationParamsList>();

const RootNavigator = () => {

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScreen}
            />
            <Stack.Screen
                name="Case"
                component={CaseScreen}
            />
            <Stack.Screen
                name="Note"
                component={NoteScreen}
            />
        </Stack.Navigator>
    );
};

export default RootNavigator;