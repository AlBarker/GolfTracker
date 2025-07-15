-- Create courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create holes table
CREATE TABLE holes (
  id SERIAL PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  par INTEGER NOT NULL,
  handicap_index INTEGER NOT NULL
);

-- Create rounds table
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  date_played TIMESTAMP WITH TIME ZONE NOT NULL,
  total_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hole_scores table
CREATE TABLE hole_scores (
  id SERIAL PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL,
  strokes INTEGER NOT NULL,
  putts INTEGER,
  fairway_hit TEXT CHECK (fairway_hit IN ('hit', 'left', 'right')),
  green_in_regulation BOOLEAN DEFAULT FALSE,
  penalty_shots INTEGER DEFAULT 0,
  up_and_down BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX idx_courses_user_id ON courses(user_id);
CREATE INDEX idx_holes_course_id ON holes(course_id);
CREATE INDEX idx_rounds_course_id ON rounds(course_id);
CREATE INDEX idx_rounds_date_played ON rounds(date_played);
CREATE INDEX idx_hole_scores_round_id ON hole_scores(round_id);

-- Enable Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE holes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE hole_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-specific data
CREATE POLICY "Users can only access their own courses" ON courses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access holes for their courses" ON holes FOR ALL USING (
  course_id IN (SELECT id FROM courses WHERE user_id = auth.uid())
);
CREATE POLICY "Users can only access rounds for their courses" ON rounds FOR ALL USING (
  course_id IN (SELECT id FROM courses WHERE user_id = auth.uid())
);
CREATE POLICY "Users can only access hole scores for their rounds" ON hole_scores FOR ALL USING (
  round_id IN (
    SELECT r.id FROM rounds r 
    JOIN courses c ON r.course_id = c.id 
    WHERE c.user_id = auth.uid()
  )
);