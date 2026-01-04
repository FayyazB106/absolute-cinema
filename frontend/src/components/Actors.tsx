import SimpleTablePage from './shared/SimpleTablePage';

export default function Actors() {
    return <SimpleTablePage title="Actors" endpoint="actors" singularName="actor" />;
}