export interface Candidate {
    id: number;
    name: string;
    grad_date: string;
    major: string;
    image_url: string;
    recruiter_specific_vote?: -1 | 0 | 1; // Optional, for displaying if the current recruiter has voted
    votes?: number;
    canVote?: boolean; // if false and no current vote, buttons disabled
    onVoteChange?: (prevVote: number, nextVote: number) => void;
    onHitLimit?: () => void;
  }
export interface Recruiter {
    recruiter_name : string;
    admin :  boolean;
}
export interface VoteInfo {
    id: number;
    vote: number;
}
export const FOOTER_SIZE = 64;