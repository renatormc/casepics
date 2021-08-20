import {  StyleSheet, View, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import values from '../../values';
import Header from './header';
import { saveNote, getNote } from '../../services/storage_manager';
import { RouteProp } from '@react-navigation/native';
import { RootNavigationParamsList } from '../../navigation/root_navigator';
import { StackNavigationProp } from '@react-navigation/stack';

type NoteScreenNavigationProp = StackNavigationProp<RootNavigationParamsList, 'Note'>;
type NoteScreenRouteProp = RouteProp<RootNavigationParamsList, 'Note'>;

type Props = {

  navigation: NoteScreenNavigationProp,
  route: NoteScreenRouteProp
};


export default function NoteScreen({ navigation, route }: Props) {

    const [noteText, setNoteText] = useState("");
    const pic = route.params.pic;
   

    const save = async () => {
        await saveNote(pic, noteText);
        navigation.navigate('Case', {
            caseName: pic.caseName
        });
    }

    const loadNote = async () => {
       const text = await getNote(pic);
       setNoteText(text);
    }

    useEffect(() => {
        loadNote();
    }, []);

    return (
        <View style={styles.container}>

            <Header title={`${pic.caseName}/${pic.name}`} onSave={save} />
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
        textAlignVertical: 'top',
        color: values.green_color
    },

})
