import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import * as React from 'react';
import ToolbarButton from '../../components/toolbar_button';
import values from '../../values';

type Props = {
  title: string,
  refreshing: boolean,
  onTakePicture: () => void,
  onClear: () => void,
  onChoosePhoto: () => void,
  onBack: () => void,
  onShowMenu: () => void,
}

export default function Header({ onTakePicture, refreshing, onClear, onChoosePhoto, onBack, onShowMenu, title }: Props) {

  return (
    <View style={styles.header}>
      <View style={styles.containerTitle} >
        <ToolbarButton icon="arrow-back" onPress={onBack}/>
        <Text style={styles.headerText}>{title}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <Pressable>
        <ActivityIndicator size={30} color={values.gold_color} animating={refreshing} />
        </Pressable>
      
        <ToolbarButton icon="delete" onPress={onClear} />
        <ToolbarButton icon="collections" onPress={onChoosePhoto} />
        <ToolbarButton icon="photo-camera" onPress={onTakePicture} />
        <ToolbarButton icon="more-vert" onPress={onShowMenu} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingLeft: 5,
    paddingRight: 0,
    width: "100%",
    height: 50,
    flexDirection: "row",
    backgroundColor: values.blue_color,
    alignItems: "center",
    justifyContent: "space-between",
  },
  containerTitle:{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: "white"
  },
})
