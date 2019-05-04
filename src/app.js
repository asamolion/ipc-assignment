import React from 'react';
import ReactDOM from 'react-dom';
import Downshift from 'downshift';
import Fuzzysort from 'fuzzysort';

import ApiClient from './api.js';
import Map from './components/Map.js';

import './style.scss';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			stations: [],
			selectedStation: ''
		};
	}

	componentDidMount() {
		Promise.all([
			ApiClient.getStationInformation(),
			ApiClient.getStationStatus()
		]).then(res => {
			const stationInformation = res[0].data.data.stations;
			const stationStatus = res[1].data.data.stations;
			const stations = [];

			stationInformation.forEach((station, index) => {
				stations.push({
					...station,
					...stationStatus[index]
				});
			});
			this.setState({
				stations
			});
		});
	}

	renderSearch() {
		const { searchInput, stations } = this.state;
		return (
			<React.Fragment>
				<Downshift
					defaultHighlightedIndex={0}
					onSelect={selectedItem => {
						this.setState({
							selectedStation: this.state.stations.find(
								station => station.name === selectedItem
							)
						});
					}}
				>
					{({
						getInputProps,
						getMenuProps,
						getItemProps,
						isOpen,
						inputValue,
						clearSelection
					}) => (
						<div>
							<div className="field">
								<input
									{...getInputProps({
										onChange: e => {
											if (e.target.value === '') {
												clearSelection();
											}
										}
									})}
									className="search-field"
									type="text"
									name="searchQuery"
								/>
							</div>

							<div className="autocomplete" {...getMenuProps()}>
								<div className="autocomplete-items">
									{isOpen
										? Fuzzysort.go(inputValue, stations, {
												key: 'name',
												limit: 20
										  })
												.map(
													suggestion =>
														suggestion.target
												)
												.map(suggestion => {
													return (
														<div
															key={suggestion}
															{...getItemProps({
																item: suggestion
															})}
														>
															{suggestion}
														</div>
													);
												})
										: null}
								</div>
							</div>
						</div>
					)}
				</Downshift>

				<div className="field">
					<input
						name="distance"
						className="distance-field"
						type="number"
						value={searchInput}
						onChange={this.handleChange}
					/>
					KM
				</div>
			</React.Fragment>
		);
	}

	render() {
		const { stations } = this.state;
		return (
			<div>
				{this.renderSearch()}
				<hr />

				<Map stations={stations} />
			</div>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('root'));