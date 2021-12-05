import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/root_navigator';


const App = () => {
  return (
    <NavigationContainer>
      <RootNavigator></RootNavigator>
    </NavigationContainer>
  );
};

export default App;
