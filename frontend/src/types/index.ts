export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string;
  role: 'Admin' | 'ChefDeService' | 'Fonctionnaire';
  service: string;
  dateCreation: string;
  estActif: boolean;
}

export interface Conge {
  id: number;
  utilisateurId: number;
  utilisateur?: Utilisateur;
  typeConge: 'Annuel' | 'Maladie' | 'Exceptionnel' | 'SansSolde';
  dateDebut: string;
  dateFin: string;
  duree: number;
  motif: string;
  statut: 'En attente' | 'Approuvé' | 'Rejeté' | 'Annulé';
  dateDemande: string;
  dateReponse?: string;
}

export interface SoldeConge {
  id: number;
  utilisateurId: number;
  annee: number;
  totalAnnuel: number;
  pris: number;
  restant: number;
}

export interface LoginResponse {
  token: string;
  utilisateur: Utilisateur;
}

export interface AuthContextType {
  user: Utilisateur | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}