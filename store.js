import { createStore } from 'vuex'
const store = createStore({
    state: {
        email: "example@gmail.com",
        formValues: {},
        formErrors: {},
        user: {},
        token: '',
    },
    getters: {
        user: (state) => {
            return state.user
        },
        token: (state) => {
            return state.token
        }
    },
    mutations: {
        setEmail(state, email) {
            state.email = email;
        },
        setValues(state, { formName, values }) {
            state.formValues = {
                ...state.formValues,
                [formName]: values,
            };
        },
        setErrors(state, { formName, errors }) {
            state.formErrors = {
                ...state.formErrors,
                [formName]: errors,
            };
        },
        login(state, { user, token }) {
            state.user = user
            state.token = token
            localStorage.setItem('auth', JSON.stringify({ user, token }))
        },
        logout(state) {
            state.user = {}
            state.token = ''
            localStorage.removeItem('auth')
        },
        setUser(state, user) {
            state.user = user
            localStorage.setItem('auth', JSON.stringify({ user, token: state.token }))
        },
        initialiseStore(state) {
            if (localStorage.getItem('auth')) {
                const lsAuth = JSON.parse(localStorage.getItem('auth') || '{}');
                state.user = lsAuth.user;
                state.token = lsAuth.token;
            }
            if (localStorage.getItem('email')) {
                state.email = localStorage.getItem('email');
            }
        },
    },
    actions: {},
    modules: {},
});

store.subscribe((mutation, state) => {
    if (mutation.type === 'setEmail') {
        localStorage.setItem('email', state.email);
    }
});

export default store;
