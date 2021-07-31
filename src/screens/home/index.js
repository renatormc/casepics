import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, TouchableOpacity, Share } from 'react-native';
import { getCases, createCase, renameCase, deleteCase, zipCase } from '../../services/storage_manager';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomSheet from "./bottom_sheet";
import RBSheet from "react-native-raw-bottom-sheet";
import prompt from 'react-native-prompt-android';
import Header from './header';
import values from '../../values';


const HomeScreen = ({navigation}) => {

    [cases, setCases] = useState([]);
    [selectedCaseIndex, setSelectedCaseIndex] = useState(-1);
    const refRBSheet = useRef();

    const reloadCases = async () => {
        let cases_ = await getCases();
        setCases(cases_);
    }

    const addNew = async () => {
        prompt(
            'Nome',
            '',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'OK',
                    onPress: async name => {
                        let newName = name.trim();
                        if (newName == "") {
                            return
                        }
                        try {
                            const createdName = await createCase(name);
                            setCases([...cases, createdName])

                        } catch (error) {
                            alert(error)
                        }
                    }
                },
            ],
            {
                type: 'text',
                cancelable: false,
                placeholder: 'Nome do caso'
            }
        );
    }

    const renameCaseWraper = async () => {
        refRBSheet.current.close();
        prompt(
            'Nome',
            '',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'OK',
                    onPress: async name => {
                        let oldName = cases[selectedCaseIndex];
                        let newName = name.trim();
                        if ((newName == "") || (newName == oldName)) {
                            return
                        }

                        try {
                            newName = await renameCase(oldName, newName);
                            let copyCases = [...cases];
                            copyCases[selectedCaseIndex] = newName;
                            setCases(copyCases);

                        } catch (error) {
                            alert(error)
                        }
                    }
                },
            ],
            {
                type: 'text',
                cancelable: false,
                defaultValue: cases[selectedCaseIndex],
                placeholder: 'Nome do caso'
            }
        );
    }

    const openCase = async (caseName) => {
        if (caseName == undefined) {
            caseName = cases[selectedCaseIndex];
        }
        caseName = caseName.toString();
        refRBSheet.current.close();
        navigation.navigate('Case', {
            caseName: caseName.toString(),
        });
    }

    const deleteCaseWrapper = async () => {
        refRBSheet.current.close();
        await deleteCase(cases[selectedCaseIndex]);
        reloadCases();
    }

    const share = async () => {
        const path = await zipCase(cases[selectedCaseIndex]);
        Share.share({
            url: `file://${path}`,
            title: 'Download PDF'
          })
        alert(path);
    }

    useEffect(() => {
        reloadCases();
    }, []);

    return (
        <View style={styles.container}>
            <Header onReload={reloadCases} />
            <SafeAreaView>
                <FlatList
                    horizontal={false}
                    data={cases}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            style={styles.listItemContainer}
                            delayLongPress={200}
                            onPress={() => {
                                setSelectedCaseIndex(index);
                                openCase(item);
                            }}
                            onLongPress={() => {
                                setSelectedCaseIndex(index)
                                refRBSheet.current.open();
                            }}
                        >
                            <View style={styles.listItemInnerContainer}>
                                <Text style={styles.listText}>{item}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
            </SafeAreaView>
            <RBSheet
                ref={refRBSheet}
                openDuration={250}
                customStyles={{
                    container: {
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                        height: 200
                    }
                }}
            >
                <BottomSheet onDelete={deleteCaseWrapper} onRename={renameCaseWraper} onShare={share}/>
            </RBSheet>

            <TouchableOpacity
                style={styles.fab}
                onPress={addNew}
            >
                <Icon style={styles.fabIcon} name='add' size={30} color='white' />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listItemContainer: {
        borderBottomWidth: 1,
        borderColor: "#C8C8C8"

    },
    listItemInnerContainer: {
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 15,
        paddingBottom: 15,
        flexDirection: "row",
        justifyContent: "center"
    },
    listText: {
        fontSize: 15,
        fontWeight: "bold",
        color: values.green_color
    },
    fab: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        position: 'absolute',
        bottom: 10,
        right: 10,
        height: 70,
        backgroundColor: values.blue_color,
        borderRadius: 100,
    },
    fabIcon: {
        color: values.gold_color
    }

});


export default HomeScreen;