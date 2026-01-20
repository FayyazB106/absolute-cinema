import SimpleTablePage from './shared/SimpleTablePage';
import { useTranslation } from "react-i18next";

export default function Actors() {
    const { t } = useTranslation();
    return <SimpleTablePage title={t('titles.directors')} endpoint="directors" />;
}