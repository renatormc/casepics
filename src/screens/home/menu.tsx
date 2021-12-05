import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface MenuProps {
    folder2: boolean,
    setFolder: (value: "folder1" | "folder2") => void,
    onClose: () => void
}

const Menu: React.FC<MenuProps> = (props: MenuProps) => {
    const changeFolder = (value: "folder1" | "folder2") => {
        props.setFolder(value);
        props.onClose();
    }

    return (
        <TouchableOpacity
            style={styles.modal}
            activeOpacity={1}
            onPress={props.onClose}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.sortByItemContainer} onPress={() => { changeFolder('folder1') }}>
                    <View style={styles.iconContainer}>
                        {!props.folder2 && <Icon name="done" size={20} />}
                    </View>
                    <Text style={styles.sortByItemText}>Pasta 1</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortByItemContainer} onPress={() => { changeFolder('folder2') }}>
                    <View style={styles.iconContainer}>
                        {props.folder2 && <Icon name="done" size={20} />}
                    </View>
                    <Text style={styles.sortByItemText}>Pasta 2</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        flexDirection: 'column',
        padding: 5,
        backgroundColor: 'white',
        height: 110,
        width: 150,
        position: "absolute",
        right: 5,
        top: 30,
        borderRadius: 10,
        elevation: 5
    },
    iconContainer: {
        width: 30,
        marginLeft: 10
    },
    sortByItemContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 20
    },
    sortByItemText: {
        color: "grey",
        fontSize: 16,
        marginLeft: 10
    }
});

export default Menu;