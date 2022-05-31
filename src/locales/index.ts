import { createI18n } from 'vue-i18n'
import zh from './zh.json'
import en from './en.json'
export const i18n = createI18n({
    locale: 'en',
    messages: {
        zh, en
    }
})