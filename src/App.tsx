import { MissionBoard } from './components/MissionBoard';
import { CARGO_LIBRARY } from './content/cargoLibrary';

export default function App() {
  return <MissionBoard cargoItems={CARGO_LIBRARY} />;
}
