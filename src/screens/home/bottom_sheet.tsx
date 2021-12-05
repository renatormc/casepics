import React from 'react'
import { TouchableOpacity, StyleSheet, View, Text, Dimensions } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import values from '../../values';

type Props = {
    onRename: () => void,
    onDelete: () => void,
    onShare: () => void,
    onChangefolder: () => void
}

export default function BottomSheet({onDelete, onRename, onShare, onChangefolder}: Props) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.item}
                onPress={onDelete}
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
                onPress={onRename}
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
                onPress={onShare}
            >
                <View style={styles.itemContainer}>
                    <Icon style={styles.itemIcon} name="share" size={18} />
                    <Text style={styles.text}>
                        Compartilhar
                    </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.item}
                onPress={onChangefolder}
            >
                <View style={styles.itemContainer}>
                    <Icon style={styles.itemIcon} name="folder" size={18} />
                    <Text style={styles.text}>
                        Mover para outra pasta
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
        width: Dimensions.get('window').width ,
        padding: 15
    },
    text: {
        fontSize: 18,
        marginLeft: 30,
        color: values.gold_color
    },
    itemIcon:{
        color: values.gold_color
    }
});
