const ELEMENTS = [
    {
        selector: 'a:not([href^="http"])',
        attribute: 'href'
    },
    {
        selector: 'img:not([src^="http"]):not([proton-src^="cid"])',
        attribute: 'src'
    }
];

const getBaseURL = (base) => {
    // Make sure base has trailing slash
    const baseUrl = base.getAttribute('href');
    if (baseUrl.substr(-1, 1) !== '/') {
        return `${baseUrl}/`;
    }
    return baseUrl;
};

/**
 * Append base url to any href/src if we need to
 * @param  {Node} html Mail parser
 * @param  {Document} doc  Output from DOMPurify
 * @return {Node}      Parser
 */
function transformBase(html, doc) {

    const base = doc.querySelector('base');

    if (!base || !base.getAttribute('href')) {
        return html;
    }

    // Make sure base has trailing slash
    const BASE_URL = getBaseURL(base);

    const bindAttribute = (node, key, value = '') => {
        if (!value.startsWith('http')) {
            node.setAttribute(key, BASE_URL + value);
        }
    };

    ELEMENTS.forEach(({ selector, attribute }) => {

        [].slice.call(html.querySelectorAll(selector)).forEach((el) => {
            const keyproton = `proton-${attribute}`;
            const value = el.getAttribute(attribute) || '';
            const ptValue = el.getAttribute(keyproton) || '';
            // Ensure we don't add a useless / if we already have one
            const url = value.charAt(0) === '/' ? value.slice(1) : value;

            /*
                Bind the value only when we need, if there is a proton-src we don't need
                to add the src else it will generate a request to the domain
             */
            !ptValue && bindAttribute(el, attribute, url);
            ptValue && bindAttribute(el, keyproton, ptValue);

        });
    });

    return html;
}
export default transformBase;
