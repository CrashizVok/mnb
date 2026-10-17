import React, { Component } from "react";
import "./MnbCurrencyRates.css";
export class MnbCurrencyRates extends Component {
	state = {
		date: "",
		rates: [],
		error: null,
		amount: 1,
		from: "EUR",
		to: "AUD",
		exchange: "",
	};

	async componentDidMount() {
		try {
			const res = await fetch("/api/rates");
			const json = await res.json();

			console.log(json);
			const { date = new Date(Date.now()), rates = [] } = json;

			this.setState({ date, rates, error: null });
			this.props.onDate?.(date);
		} catch (error) {
			console.warn(error);
			this.setState({ error, date: "", rates: [] });
		}
	}

	change = () => {
		const from = this.state.from;
		const to = this.state.to;

		this.setState({ from: to, to: from });
	};

	render() {
		const { date = "", rates = [], error = null, from = "", to = "", amount = "" } = this.state;

		const rateOne = this.state.rates.find((x) => x.curr === from);
		const rateTwo = this.state.rates.find((x) => x.curr === to);

		const result =
			rateOne && rateTwo
				? (
						(amount * (rateOne.value / rateOne.unit)) /
						(rateTwo.value / rateTwo.unit)
					).toFixed(4)
				: "";
		const formatted_res = result + " " + to;
		const formattes_micro = amount + " " + from + " = " + formatted_res;

		return (
			<div>
				<section className="mnb">
					{error && <p className="mnb-error">Hiba: {String(error)}</p>}

					<div className="mnb-layout">
						<div className="mnb-table-wrap">
							<table className="mnb-table">
								<thead>
									<tr>
										<th>Deviza</th>
										<th>Egység</th>
										<th>Árfolyam (HUF)</th>
									</tr>
								</thead>
								<tbody>
									{rates.map((rate) => (
										<tr key={rate.curr}>
											<td>{rate.curr}</td>
											<td>{rate.unit}</td>
											<td>{rate.value}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<form className="mnb-form">
							<h3>Átváltó</h3>
							<label>
								Összeg{" "}
								<input
									type="number"
									name="amount"
									min="0"
									step="any"
									value={this.state.amount}
									onChange={(e) => this.setState({ amount: e.target.value })}
								/>
							</label>
							<label>
								Ebből{" "}
								<select
									name="from"
									value={this.state.from}
									onChange={(e) => this.setState({ from: e.target.value })}
								>
									{rates.map((rate) => (
										<option key={rate.curr} value={rate.curr}>
											{rate.curr}
										</option>
									))}
								</select>
							</label>
							<button type="button" title="Felcserélés" onClick={this.change}>
								{" "}
								⇅
							</button>
							<label>
								Ebbe{" "}
								<select
									name="to"
									value={this.state.to}
									onChange={(e) => this.setState({ to: e.target.value })}
								>
									{rates.map((rate) => (
										<option key={rate.curr} value={rate.curr}>
											{rate.curr}
										</option>
									))}
								</select>
							</label>
							<output className="mnb-result">
								<h2>{formatted_res}</h2>
								<p>{formattes_micro}</p>
							</output>
						</form>
					</div>
				</section>
			</div>
		);
	}
}

export default MnbCurrencyRates;
