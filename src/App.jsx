import { useState } from "react";
import "./App.css";
import MnbCurrencyRates from "./MnbCurrencyRates";

function App() {
	const [date, setDate] = useState("");

	return (
		<div>
			<h1>MNB árfolyamok</h1> ({date})
			<MnbCurrencyRates onDate={setDate} />
		</div>
	);
}

export default App;
