import React, { useEffect, useState } from 'react';

import './App.css';

import logo from './img/logo.svg';
import search from './img/search.svg';

// some useful functions are stored away a helpers file, as it could be re-used elsewhere in ths project
import { API_ROUTE, fuzzyMatch, formatNumber, isDuplicateProduct, makeGetRequest } from './helpers';

const App = () => {
	const [query, setQuery] = useState('');
	const [products, setProducts] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				// request all data in parallel
				const data = (
					await Promise.all([
						makeGetRequest(`${API_ROUTE}/branch1.json`),
						makeGetRequest(`${API_ROUTE}/branch2.json`),
						makeGetRequest(`${API_ROUTE}/branch3.json`),
					])
				)
					// merge returned [{ branchId, products }] so that it resolves to a single array of [products]
					?.reduce((acc, curr) => [...acc, ...(curr?.products ?? [])], [])
					// check for duplicates whilst iterating,
					// if duplicate found, prevent injection into the accumulator, and increment the original product's
					// sold value when duplicate found
					?.reduce((acc, curr) => {
						const duplicate = acc?.find((item) => isDuplicateProduct(item, curr));

						if (!!duplicate) {
							// a duplicate was found, loop current set of products, find duplicate and add onto existing
							// sold value, don't inject this product into the accumulator as it already exists.
							return acc?.map((item) =>
								item === duplicate ? { ...duplicate, sold: item?.sold + curr?.sold } : item,
							);
						}

						// duplicate not found, immutably add this project into the accumulator
						return [...acc, curr];
					}, []);

				setProducts(data);
				setLoading(false);
			} catch (error) {
				// Likely an API issue...
				console.log({ error });
			}
		})();
	}, []);

	// Filter products in case a query has been made, ensuring user only sees products that includes the query
	// const filteredProducts = products?.filter(({ name }) => name?.toLowerCase()?.includes(query?.toLowerCase()));
	const filteredProducts = products?.filter(({ name }) => fuzzyMatch(name?.toLowerCase(), query?.toLowerCase()));

	// I added a loading ternary lower down to show how loading shouldn't hinder rendering content that isn't directly
	// dependent on the API data, however I have left this line in to ensure the loading test passes.
	if (loading) return 'Loading...';

	return (
		<main>
			<div className="container">
				<div className="logo">
					<img alt="Wowcher logo" src={logo} />
				</div>

				<h1>Products</h1>
				<div className="product-list">
					<div className="product-list-search">
						<label htmlFor="search">Search Products</label>
						<div className="product-list-search-input">
							<input
								id="search"
								placeholder="e.g. Apple"
								type="text"
								onChange={(e) => setQuery(e.target.value)}
								value={query}
							/>
							<img alt="Search icon" src={search} />
						</div>
					</div>

					{loading ? (
						<p>Loading...</p>
					) : !!filteredProducts?.length ? (
						<div className="product-list-table">
							<table>
								<thead>
									<tr>
										<th>Product</th>
										<th>Revenue</th>
									</tr>
								</thead>
								<tbody>
									{/* sort products alphabetically, then return name and revenue of each product */}
									{filteredProducts
										?.sort((a, b) => (a?.name > b?.name ? 1 : -1))
										?.map(({ id, name, sold, unitPrice }) => (
											<tr key={name}>
												<td>{name}</td>
												<td>{formatNumber(sold * unitPrice)}</td>
											</tr>
										))}
								</tbody>
								<tfoot>
									<tr>
										<td>Total</td>
										<td>
											{/* reduce over filtered products, multiply sold and unitPrice to get
												revenue and add to accumulator in order to calculate total revenue */}
											{formatNumber(
												filteredProducts?.reduce(
													(acc, { sold, unitPrice }) => acc + sold * unitPrice,
													0,
												),
											)}
										</td>
									</tr>
								</tfoot>
							</table>
						</div>
					) : (
						// fallback if filtered products returns empty array (queried or initial data was empty)
						<p>We're sorry, there were no products found.</p>
					)}
				</div>
			</div>

			<footer>
				<div className="container">© Copyright Wowcher {new Date().getFullYear()}</div>
			</footer>
		</main>
	);
};

export default App;
