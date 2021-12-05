import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CaseScreen from '../screens/case';
import HomeScreen from '../screens/home';
import NoteScreen from '../screens/note';
import { Pic } from '../types/interfaces';


export type RootNavigationParamsList = {
    Home: {
        folder2: boolean
    }, 
    Case: {
        caseName: string,
        folder2: boolean
    },
    Note: {
        pic: Pic,
        folder2: boolean
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
                initialParams={{folder2: false}}
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