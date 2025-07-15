-- Create courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE INDEX idx_holes_course_id ON holes(course_id);
CREATE INDEX idx_rounds_course_id ON rounds(course_id);
CREATE INDEX idx_rounds_date_played ON rounds(date_played);
CREATE INDEX idx_hole_scores_round_id ON hole_scores(round_id);

-- Enable Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE holes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE hole_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you may want to restrict this later)
CREATE POLICY "Enable all operations for all users" ON courses FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON holes FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON rounds FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON hole_scores FOR ALL USING (true);