import { Button, StyleSheet, View, TextInput, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import values from '../../values';
import Header from './header';
import { saveNote, getNote } from '../../services/storage_manager';
// import Icon from 'react-native-vector-icons/MaterialIcons';


export default function NoteScreen({ navigation, route }) {

    const [noteText, setNoteText] = useState("");
    const caseName = route.params.caseName;
    const picName = route.params.picName;

    const save = async () => {
        await saveNote(picName, caseName, noteText);
        navigation.navigate('Case', {
            caseName: caseName
        });
    }

    const loadNote = async () => {
       const text = await getNote(picName, caseName);
       setNoteText(text);
    }

    useEffect(() => {
        loadNote();
    }, []);

    return (
        <View style={styles.container}>

            <Header title={`${caseName}/${picName}`} onSave={save} />
            <TextInput
                style={styles.input}
                onChangeText={setNoteText}
                multiline
                value={noteText}
                placeholder="Adicione um texto"
            />

        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        height: "100%"
    },
    containerTitle: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: values.green_color
    },
    input: {
        height: 500,
        // borderWidth: 1,
        marginTop: 10,
        // borderColor: values.green_color,
        textAlignVertical: 'top'
    },

})
