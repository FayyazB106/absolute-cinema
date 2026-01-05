import SimpleTablePage from './shared/SimpleTablePage';

export default function Statuses() {
    return <SimpleTablePage title="Statuses" endpoint="statuses" singularName="status" />;
}