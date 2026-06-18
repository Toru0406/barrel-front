export type ContentSetStatus = 'pending' | 'processing' | 'complete' | 'error';
export type Channel = 'twitter' | 'instagram' | 'newsletter' | 'line';

export interface Database {
  public: {
    Tables: {
      content_sets: {
        Row: {
          id: string;
          user_id: string;
          status: ContentSetStatus;
          analytics_data: Record<string, unknown> | null;
          error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: ContentSetStatus;
          analytics_data?: Record<string, unknown> | null;
          error?: string | null;
        };
        Update: {
          status?: ContentSetStatus;
          analytics_data?: Record<string, unknown> | null;
          error?: string | null;
          updated_at?: string;
        };
      };
      contents: {
        Row: {
          id: string;
          content_set_id: string;
          channel: Channel;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          content_set_id: string;
          channel: Channel;
          body: string;
        };
        Update: never;
      };
    };
  };
}
