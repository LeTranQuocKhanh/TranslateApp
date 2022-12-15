import { ActivityIndicator, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
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

export default function HistoryScreen(props) {
    const params = props.route.params || {};

    const dispatch = useDispatch();
    const history = useSelector(state => state.history.items);
    const [inMemory, setInMemory] = useState(history)

    const [enteredText, setEnteredText] = useState("")
    // const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        dispatch(loadData());
        // setInMemory(history)
    }, [dispatch]);

    useEffect(() => {
        const saveHistory = async () => {
            try {
                await AsyncStorage.setItem('history', JSON.stringify(history));
            } catch (error) {
                console.log(error);
            }
        }
        saveHistory(history);
        setInMemory(history);
    }, [history]);

    // const onSubmit = useCallback(async () => {

    //     try {
    //         setIsLoading(true);
    //         const result = await Translate(enteredText, languageFrom, languageTo);

    //         if (!result) {
    //             setResultText("");
    //             return;
    //         }

    //         // const textResult = result.translated_text[result.to];
    //         const textResult = result.translated_text
    //         console.log(result)
    //         setResultText(textResult);

    //         const id = uuid.v4();
    //         result.id = id;
    //         result.dateTime = new Date().toISOString();

    //         dispatch(addHistoryItem({ item: result }));
    //     } catch (error) {
    //         console.log(error);
    //     }
    //     finally {
    //         setIsLoading(false);
    //     }

    // }, [enteredText, languageTo, languageFrom, dispatch]);

    // const copyToClipboard = useCallback(async () => {
    //     await Clipboard.setStringAsync(resultText);
    // }, [resultText]);


    // const speakTranslated = useCallback(async () => {
    //     await Speech.speak(resultText);
    // }, [resultText]);

    const search = useCallback(async (enteredText) => {
        const memoriesHistory = history
        const result = memoriesHistory.filter(item =>
             {  
                return item.original_text.toLowerCase().indexOf(enteredText.toLowerCase()) > -1 || item.translated_text.toLowerCase().indexOf(enteredText.toLowerCase()) > -1
            }
        )
        setInMemory(result)
    }, [enteredText]);

  return (

    <View style={styles.historyContainer}>
    <View style={styles.searchBar}>
        <TextInput style={styles.searchInput}
            placeholder='Enter your search'
            onChangeText={enteredText => search(enteredText)}
            >
            

        </TextInput>
        <TouchableOpacity
                onPress={search}
                style={styles.iconContainer}>
                <Ionicons 
                    name="search"
                    size={24} 
                    color={enteredText !== "" ? colors.textColor : colors.textColorDisabled} />
        </TouchableOpacity>

        
    </View>
    <FlatList
        data={inMemory.slice().reverse()}
        renderItem={itemData => {
            return <TranslationResult itemId={itemData.item.id} />
        }}
    />
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
  },
  searchBar:{
    paddingHorizontal: 10,
    flexDirection: 'row',
  },
  searchInput :{
    flex: 3,
    fontFamily: 'regular',
    letterSpacing: 0.3,
    height: 50,
    color: colors.textColor
  }
});
