import SimpleTablePage from './shared/SimpleTablePage';
import { useTranslation } from "react-i18next";

export default function Statuses() {
    const { t } = useTranslation();
    return <SimpleTablePage title={t('titles.statuses')} endpoint="statuses" />;
}