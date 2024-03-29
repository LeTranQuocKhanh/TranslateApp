// import translate from 'translate-google-api';
import translate from "translate";

export const Translate = async (text, languageFrom, languageTo) => {
    // const axios = require("axios");

    // const options = {
    // method: 'GET',
    // url: 'https://nlp-translation.p.rapidapi.com/v1/translate',
    // params: {text: text, to: languageTo, from: languageFrom},
    // headers: {
    //     'X-RapidAPI-Key': '7fb15711b0mshdcf75f9ebce235ep112814jsne23cb9110ba4',
    //     'X-RapidAPI-Host': 'nlp-translation.p.rapidapi.com'
    // }
    // };

    // const response = await axios.request(options).catch(function (error) {
    //     console.error(error);
    // });

    // if (response.status !== 200) {
    //     console.log(response);
    //     throw new Error("Translate call failed. Response status: " + response.status);
    // }

    // return response.data;
    translate.engine = "google"; // Or "yandex", "libre", "deepl"
    
    const textTranslated = await translate(text, {from: languageFrom, to: languageTo } );
    const result = {
        "from": languageFrom,
        "original_text": text,
        "translated_text": textTranslated 
    }
    return result
}