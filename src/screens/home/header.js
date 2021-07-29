import { View, Text, StyleSheet } from 'react-native';
import * as React from 'react';
import ToolbarButton from '../../components/toolbar_button';
import values from '../../values';


export default function Header({ onReload }) {

  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>Casos</Text>
      <View style={styles.buttonsContainer}>
        <ToolbarButton icon="refresh" onPress={onReload} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingLeft: 10,
    paddingRight: 10,
    width: "100%",
    height: 50,
    flexDirection: "row",
    backgroundColor: values.blue_color,
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: values.gold_color
  },
})
