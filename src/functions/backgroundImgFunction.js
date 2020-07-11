export default function imgService(text) {
    return fetch(
        `https://pixabay.com/api/?image_type=all&orientation=horizontal&q=${text}&per_page=20&key=17221091-0955a767c62ae6619bb38d11b`, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        }
    ).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return false;
        }
    });
}