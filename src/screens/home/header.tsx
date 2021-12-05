import { View, Text, StyleSheet } from 'react-native';
import * as React from 'react';
// import ToolbarButton from '../../components/toolbar_button';
import values from '../../values';
import ToolbarButton from '../../components/toolbar_button';

type Props = {
  title: string,
  onShowMenu: () => void,
}

export default function Header({title, onShowMenu}: Props) {

  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{title}</Text>
      <View style={styles.buttonsContainer}>
        {/* <ToolbarButton icon="refresh" onPress={onReload} /> */}
      </View>
      <View style={styles.buttonsContainer}>
       
        <ToolbarButton icon="more-vert" onPress={onShowMenu} />
      
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
  headerText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: values.gold_color
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  button: {
    marginRight: 15
  }
})
