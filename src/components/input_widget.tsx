import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import values from '../values';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface InputWidgetProps {
    icon?: string,
    value?: string,
    onChangeText?(value: string): void,
    placeholder?: string,
    height?: number,
    secureTextEntry?: boolean,
    multiline?: boolean,
    style?: object
}

const InputWidget: React.FC<InputWidgetProps> = (props: InputWidgetProps) => {
   
    return (
        <View style={[styles.inputView, props.style, { height: props.height }]} >
            <TextInput
                style={[styles.inputText, { height: props.height }]}
                placeholder={props.placeholder}
                placeholderTextColor="#003f5c"
                value={props.value}
                secureTextEntry={props.secureTextEntry}
                multiline={props.multiline}
                onChangeText={props.onChangeText} />
            {
                props.icon && <Icon name={props.icon} style={styles.icon} size={25} color={values.green_color}/>
            }

        </View>
    );
}

InputWidget.defaultProps = {
    secureTextEntry: false,
    multiline: false,
    height: 50,
    style: {}
}

const styles = StyleSheet.create({
    inputView: {
        flexDirection: 'row',
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#F0F0F0",
        borderRadius: 15,
        padding: 10,
    },
    inputText: {
        flex: 1,
        alignItems: "flex-start",
        color: values.green_color,
        textAlignVertical: 'center',
        // backgroundColor: 'red'
    },
    icon: {
        color: values.green_color,
    }
});

export default InputWidget;