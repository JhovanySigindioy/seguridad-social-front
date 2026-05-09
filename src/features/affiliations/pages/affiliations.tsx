import { AffiliationsTable } from '../components/AffiliationsTable';

interface AffiliationsPageProps {
  onNewAffiliation?: () => void;
}

export const AffiliationsPage = ({ onNewAffiliation }: AffiliationsPageProps) => {
  return (
    <AffiliationsTable onNewAffiliation={onNewAffiliation} />
  );
};