// API declaration, in the real world this would be a environment-dependent value
export const API_ROUTE = `/api`;

export const formatNumber = (number) => new Intl.NumberFormat('en', { minimumFractionDigits: 2 }).format(number);

// returns a boolean depending on whether the string given matches the query
// (injects `.*` between each character in a given pattern to build a RegExp)
export const fuzzyMatch = (str, query) => {
	query = query?.split('')?.reduce((a, b) => `${a}.*${b}`, '');
	return new RegExp(query)?.test(str);
};

// returns a boolean
// check that both products have matching { name, id, unitPrice } properties to ensure they're duplicate datasets
export const isDuplicateProduct = (a, b) =>
	a?.name === b?.name && a?.id === b?.id && a?.unitPrice === b?.unitPrice;

// returns JSON response
// re-usable function for GET requests that return JSON
export const makeGetRequest = (url) => fetch(url).then((res) => res.json());
