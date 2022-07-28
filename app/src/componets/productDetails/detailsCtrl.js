import PushAlert from '../../commons/notification';

export default class ProductCtrl {
    static copyToClipboard(e) {
        navigator.clipboard.writeText(window.location.href);
        PushAlert.info('Link copied to clipboard');

        navigator.share && navigator
            .share({
                title: document.title,
                text: window.location.href,
                url: window.location.href
            })
            .then(() => console.log('Successful share! 🎉'))
            .catch(err => console.error(err));
    }

    static isInValidPayload = (payload) => {
        return (
            void 0 === payload || 
            (Object.keys(payload).length === 0 && payload.constructor === Object)
        )
    }
}