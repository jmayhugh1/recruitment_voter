export interface Candidate {
    id: number;
    name: string;
    grad_date: number;
    major: string;
    image_url: string;
    votes?: -1 | 0 | 1; // Optional, for displaying vote status
  }

export interface VoteInfo {
    id: number;
    votes: number;
}