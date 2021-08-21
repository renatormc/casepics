import { Pressable, StyleSheet, View } from 'react-native';
import * as React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import values from '../values';

type Props = {
    icon: string,
    style?: object,
    onPress: () => void
  }

export default function ToolbarButton({icon, onPress, style}: Props) {
    return (
        <View style={[styles.container, style]}>
            <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                {
                    opacity: pressed
                        ? 0.5
                        : 1,
                }]} >
            <Icon name={icon} style={styles.icon} />

        </Pressable >
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        // marginLeft: 15
    },
    icon: {
      color: values.gold_color,
      fontSize: 30
    },
  })
  