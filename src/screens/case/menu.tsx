import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
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

    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        padding: 5,
        backgroundColor: 'white',
        height: 120,
        width: 180,
        position: "absolute",
        right: 5,
        top: 30,
        borderRadius: 10,
        // shadowOffset: {
        //     width: 0,
        //     height: 10
        // },
        // shadowOpacity: 0.3,
        // shadowRadius: 3,
        // shadowColor: "black",
        elevation: 5
    },
    iconContainer: {
        width: 30
    },
    title: {
        borderBottomColor: "grey",
        borderBottomWidth: 1,
        padding: 5,
        fontSize: 15
    },
    sortByItemContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 10
    },
    sortByItemText: {
        fontSize: 16,
        marginLeft: 10
    }
});

export default Menu;