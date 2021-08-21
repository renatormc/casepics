import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface MenuProps {
    sortBy: string,
    setSortBy: (value: "timestamp" | "alpha") => void,
    onClose: () => void
}

const Menu: React.FC<MenuProps> = (props: MenuProps) => {
    const changeSortBy = (value: "timestamp" | "alpha") => {
        props.setSortBy(value);
        props.onClose();
    }

    return (
        <TouchableOpacity
            style={styles.modal}
            activeOpacity={1}
            onPress={props.onClose}>
            <View style={styles.container}>
                <Text style={styles.title}>Ordenar por</Text>
                <TouchableOpacity style={styles.sortByItemContainer} onPress={() => { changeSortBy('timestamp') }}>
                    <View style={styles.iconContainer}>
                        {props.sortBy === 'timestamp' && <Icon name="done" size={20} />}
                    </View>
                    <Text style={styles.sortByItemText}>Timestamp</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortByItemContainer} onPress={() => { changeSortBy('alpha') }}>
                    <View style={styles.iconContainer}>
                        {props.sortBy === 'alpha' && <Icon name="done" size={20} />}

                    </View>

                    <Text style={styles.sortByItemText}>Ordem alfabética</Text>
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
        height: 150,
        width: 200,
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
    title: {
        color: "grey",
        borderBottomColor: "#F0F0F0",
        borderBottomWidth: 1,
        padding: 5,
        fontSize: 15
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