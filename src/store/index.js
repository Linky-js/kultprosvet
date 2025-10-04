import { createStore } from "vuex";
import audioPlayer from './module/audioPlayer.js';
export default createStore({
    modules: {
        audioPlayer
    },
    state: {
        user: {
            user_id: false,
            username: 'guest', //--не залогинен
            auth_key: 'YdZ2jtC4aPcjUtN6_g_HzkkzuXKf0XLv',
            email: '',
            role: {
                item_name: 'guest'
            },
            name: '',

            isLogged: false,
            profile: {
                ip: null,
            }
        },
        isMobile: false,
        apiUrl: `https://api.культпросвет.fun/web/index.php?r=`,
        apiDomain: 'https://api.культпросвет.fun/',
        flash_messsage: {
            title: '',
            massage: '',
            type: ''
        },
        local: {
            city: "Москва",
            id: 605,
        },
    },
    mutations: {
        setUser(state, user) {
            state.user = user
        },
        setLocal(state, local) {
            state.local = local
        },
        setUserData(state, user) {

            if (user.id) { state.user.user_id = user.id }
            if (user.username) { state.user.username = user.username }
            if (user.auth_key) { state.user.auth_key = user.auth_key }
            if (user.tg) { state.user.tg = user.tg }
            if (user.email) { state.user.email = user.email }
            if (user.role) { state.user.role = user.role }
            if (user.profile) { state.user.profile = user.profile }
        },
        setLogged(state, logged) {
            state.user.isLogged = logged
        },
        setIsMobile(state, isMobile) {
            state.isMobile = isMobile
        },
        setFlashMessage(state, flashMessage) {
            state.flash_messsage = flashMessage
        }
    },
    getters: {
        getUser: state => {

            return state.user
        },
        getIsMobile: state => {

            return state.isMobile
        },
        getApiUrl: state => {

            return state.apiUrl
        },
        getApiDomain: state => {

            return state.apiDomain
        },
        getFlashMessage: state => {
            return state.flash_messsage
        },
        getLocal: state => {
            return state.local
        }
    },
})