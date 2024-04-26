import { defineStore } from 'pinia';

export const useMailCodesStore = defineStore('mailCodes', {
    state: () => ({
        emailCodes: {}
    }),
    actions: {
        setCode(email, code) {
            this.emailCodes[email] = code;
        },
        removeCode(email) {
            delete this.emailCodes[email];
        },
        getCode(email) {
            return this.emailCodes[email];
        }
    }
});