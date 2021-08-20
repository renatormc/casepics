import React, { Component } from 'react'
import { TouchableOpacity, StyleSheet, View, Text, Dimensions } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import values from '../../values';


type Props = {
    onVizualizePress: () => void,
    onDeletePress: () => void,
    onRenamePress: () => void,
    onEditNote: () => void,
}

export default function BottomSheed({ onVizualizePress, onDeletePress, onRenamePress, onEditNote }: Props) {
    return (
        <View style={styles.container}>

            <TouchableOpacity
                style={styles.item}
                onPress={onVizualizePress}
            >
                <View style={styles.itemContainer}>
                    <Icon style={styles.itemIcon} name="visibility" size={18} />
                    <Text style={styles.text}>
                        Vizualizar
                    </Text>
                </View>

            </TouchableOpacity>
            <TouchableOpacity
                style={styles.item}
                onPress={onDeletePress}
            >
                <View style={styles.itemContainer}>
                    <Icon style={styles.itemIcon} name="delete" size={18} />
                    <Text style={styles.text}>
                        Deletar
                    </Text>
                </View>

            </TouchableOpacity>
            <TouchableOpacity
                style={styles.item}
                onPress={onRenamePress}
            >
                <View style={styles.itemContainer}>
                    <Icon style={styles.itemIcon} name="edit" size={18} />
                    <Text style={styles.text}>
                        Renomear
                    </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.item}
                onPress={onEditNote}
            >
                <View style={styles.itemContainer}>
                    <Icon style={styles.itemIcon} name="description" size={18} />
                    <Text style={styles.text}>
                        Editar nota
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        justifyContent: "flex-start",
        alignContent: "flex-start",
        flexDirection: "column",
        backgroundColor: values.blue_color,
        width: "100%",
        height: "100%"
    },

    itemContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    item: {
        width: Dimensions.get('window').width / 2,
        padding: 15,
        // borderBottomWidth: 1,
        // borderColor: values.green_color,
        // width: "100%"
    },
    text: {
        fontSize: 18,
        marginLeft: 30,
        color: values.gold_color
    },
    itemIcon: {
        // color: "grey",
        color: values.gold_color
    }
});
