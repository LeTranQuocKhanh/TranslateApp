import { ActivityIndicator, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AntDesign, Ionicons, MaterialIcons ,Octicons } from '@expo/vector-icons';
import colors from '../utils/colors';
import { useCallback, useEffect, useState } from 'react';
import supportedLanguages from '../utils/supportedLanguages';
import { Translate } from '../utils/translate';
import * as Clipboard from 'expo-clipboard';
import { useDispatch, useSelector } from 'react-redux';
import { addHistoryItem, setHistoryItems } from '../store/historySlice';
import TranslationResult from '../components/TranslationResult';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setSavedItems } from '../store/savedItemsSlice';
import * as Speech from 'expo-speech';



const loadData = () => {
    return async dispatch => {
        try {
            const historyString = await AsyncStorage.getItem('history');
            if (historyString !== null) {
                const history = JSON.parse(historyString);
                dispatch(setHistoryItems({ items: history }));
            }

            const savedItemsString = await AsyncStorage.getItem('savedItems');
            if (savedItemsString !== null) {
                const savedItems = JSON.parse(savedItemsString);
                dispatch(setSavedItems({ items: savedItems }));
            }
        } catch (error) {
            console.log(error);
        }
    }
}

export default function HomeScreen(props) {
    const params = props.route.params || {};

    const dispatch = useDispatch();
    const history = useSelector(state => state.history.items);

    const [enteredText, setEnteredText] = useState("");
    const [resultText, setResultText] = useState("");
    const [languageTo, setLanguageTo] = useState("vi");
    const [languageFrom, setLanguageFrom] = useState("en");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (params.languageTo) {
            setLanguageTo(params.languageTo);
        }

        if (params.languageFrom) {
            setLanguageFrom(params.languageFrom);
        }
    }, [params.languageTo, params.languageFrom]);


    useEffect(() => {
        dispatch(loadData());
    }, [dispatch]);

    useEffect(() => {
        const saveHistory = async () => {
            try {
                await AsyncStorage.setItem('history', JSON.stringify(history));
            } catch (error) {
                console.log(error);
            }
        }

        saveHistory();
    }, [history]);


    const onSubmit = useCallback(async () => {

        try {
            setIsLoading(true);
            console.log(languageFrom, languageTo )
            const result = await Translate(enteredText, languageFrom, languageTo);

            if (!result) {
                setResultText("");
                return;
            }

            // const textResult = result.translated_text[result.to];
            const textResult = result.translated_text
            setResultText(textResult);

            const id = uuid.v4();
            result.id = id;
            result.dateTime = new Date().toISOString();
            result.original_text = enteredText;

            dispatch(addHistoryItem({ item: result }));
        } catch (error) {
            console.log(error);
        }
        finally {
            setIsLoading(false);
        }

    }, [enteredText, languageTo, languageFrom, dispatch]);


    const switchLanguage = async () =>{
        let temp = languageFrom;
        setLanguageFrom(languageTo)
        setLanguageTo(temp)

        console.log('From', languageFrom, 'To', languageTo)
    }

    const clear =async () => {
        await setEnteredText("")
        console.log('This is enterText', enteredText)
    }


    const copyToClipboard = useCallback(async () => {
        await Clipboard.setStringAsync(resultText);
    }, [resultText]);


    const speakTranslated = useCallback(async () => {
        const options={
            "language": languageTo
        };
        await Speech.speak(resultText,options);
    }, [resultText]);

    const speak = useCallback(async () => {
        const options={
            "language": languageFrom
        };
        Speech.speak(enteredText, options);
    }, [enteredText]);

  return (
      <View style={styles.container}>
        <View style={styles.languageContainer}>
            <TouchableOpacity
                style={styles.languageOption}
                onPress={() => props.navigation.navigate("languageSelect", { title: "Translate from", selected: languageFrom, mode: 'from' })}>
                <Text style={styles.languageOptionText}>{supportedLanguages[languageFrom]}</Text>
            </TouchableOpacity>


            <TouchableOpacity
                style={styles.arrowContainer}
                onPress={switchLanguage}>
                <Octicons name="arrow-switch" size={24} color={colors.lightGrey} />
            </TouchableOpacity>


            <TouchableOpacity
                style={styles.languageOption}
                onPress={() => props.navigation.navigate("languageSelect", { title: "Translate to", selected: languageTo, mode: 'to' })}>
                <Text style={styles.languageOptionText}>{supportedLanguages[languageTo]}</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
            <TextInput
                multiline
                numberOfLines={10}
                placeholder='Enter text'
                style={styles.textInput}
                onChangeText={(text) => setEnteredText(text)}
                value={enteredText}
            />


            {enteredText ? 
            <TouchableOpacity
                onPress={clear}
                style={styles.iconContainer}>
                <AntDesign name="close" size={24} color={colors.textColor} />
            </TouchableOpacity>: null}

            <TouchableOpacity
                onPress={speak}
                style={styles.iconContainer}>
                <MaterialIcons 
                    name="volume-up"
                    size={24} 
                    color={enteredText !== "" ? colors.textColor : colors.textColorDisabled} />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={isLoading ? undefined : onSubmit}
                disabled={enteredText === ""}
                style={styles.iconContainer}>

                {
                    isLoading ?
                    <ActivityIndicator size={'small'} color={colors.primary} /> :
                    <Ionicons 
                        name="arrow-forward-circle-sharp"
                        size={24} 
                        color={enteredText !== "" ? colors.primary : colors.primaryDisabled} />
                }
                
            </TouchableOpacity>
        </View>

        <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{resultText}</Text>

            <TouchableOpacity
                onPress={speakTranslated}
                disabled={resultText === ""}
                style={styles.iconContainer}>
                <MaterialIcons 
                    name="volume-up"
                    size={24} 
                    color={resultText !== "" ? colors.textColor : colors.textColorDisabled} />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={copyToClipboard}
                disabled={resultText === ""}
                style={styles.iconContainer}>
                <MaterialIcons 
                    name="content-copy"
                    size={24} 
                    color={resultText !== "" ? colors.textColor : colors.textColorDisabled} />
            </TouchableOpacity>
        </View>

        <View style={styles.historyContainer}>
            <FlatList
                data={history.slice().reverse()}
                renderItem={itemData => {
                    return <TranslationResult itemId={itemData.item.id} />
                }}
            />
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  languageContainer: {
    flexDirection: 'row',
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1
  },
  languageOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15
  },
  arrowContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageOptionText: {
    color: colors.primary,
    fontFamily: 'regular',
    letterSpacing: 0.3
  },
  inputContainer: {
    flexDirection: 'row',
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1
  },
  textInput: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontFamily: 'regular',
    letterSpacing: 0.3,
    height: 90,
    color: colors.textColor
  },
  iconContainer: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  resultContainer: {
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 90,
    paddingVertical: 15
  },
  resultText: {
    fontFamily: 'regular',
    letterSpacing: 0.3,
    color: colors.primary,
    flex: 1,
    marginHorizontal: 20
  },
  historyContainer: {
    backgroundColor: colors.greyBackground,
    flex: 1,
    padding: 10
  }
});
