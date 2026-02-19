import { supabase } from '@/integrations/supabase/client';
import type {
  HomepageContent,
  AboutSection,
  Department,
  Faculty,
  Event,
  GalleryImage,
  ContactSubmission,
  Stat,
  Member,
} from '@/types/database';
 
 // Homepage Content
 export async function getHomepageContent() {
   const { data, error } = await supabase
     .from('homepage_content')
     .select('*')
     .eq('is_active', true)
     .order('order_index');
   
   if (error) throw error;
   return data as HomepageContent[];
 }
 
 // About Section
 export async function getAboutSections() {
   const { data, error } = await supabase
     .from('about_section')
     .select('*')
     .order('order_index');
   
   if (error) throw error;
   return data as AboutSection[];
 }
 
 // Departments
 export async function getDepartments() {
   const { data, error } = await supabase
     .from('departments')
     .select('*')
     .eq('is_active', true)
     .order('order_index');
   
   if (error) throw error;
   return data as Department[];
 }
 
 export async function getDepartmentById(id: string) {
   const { data, error } = await supabase
     .from('departments')
     .select('*')
     .eq('id', id)
     .single();
   
   if (error) throw error;
   return data as Department;
 }
 
 // Faculty
 export async function getFaculty() {
   const { data, error } = await supabase
     .from('faculty')
     .select('*, departments(*)')
     .eq('is_active', true)
     .order('order_index');
   
   if (error) throw error;
   return data as Faculty[];
 }
 
 export async function getFacultyByDepartment(departmentId: string) {
   const { data, error } = await supabase
     .from('faculty')
     .select('*, departments(*)')
     .eq('department_id', departmentId)
     .eq('is_active', true)
     .order('order_index');
   
   if (error) throw error;
   return data as Faculty[];
 }
 
 // Events
 export async function getEvents() {
   const { data, error } = await supabase
     .from('events')
     .select('*')
     .eq('is_active', true)
     .order('event_date', { ascending: true });
   
   if (error) throw error;
   return data as Event[];
 }
 
 export async function getUpcomingEvents() {
   const { data, error } = await supabase
     .from('events')
     .select('*')
     .eq('is_active', true)
     .gte('event_date', new Date().toISOString())
     .order('event_date', { ascending: true })
     .limit(5);
   
   if (error) throw error;
   return data as Event[];
 }
 
 export async function getFeaturedEvents() {
   const { data, error } = await supabase
     .from('events')
     .select('*')
     .eq('is_active', true)
     .eq('is_featured', true)
     .order('event_date', { ascending: true });
   
   if (error) throw error;
   return data as Event[];
 }
 
 // Gallery
 export async function getGalleryImages() {
   const { data, error } = await supabase
     .from('gallery')
     .select('*')
     .order('order_index');
   
   if (error) throw error;
   return data as GalleryImage[];
 }
 
 export async function getFeaturedGalleryImages() {
   const { data, error } = await supabase
     .from('gallery')
     .select('*')
     .eq('is_featured', true)
     .order('order_index')
     .limit(6);
   
   if (error) throw error;
   return data as GalleryImage[];
 }
 
 // Stats
 export async function getStats() {
   const { data, error } = await supabase
     .from('stats')
     .select('*')
     .eq('is_active', true)
     .order('order_index');
   
  if (error) throw error;
  return data as Stat[];
}

// Members
export async function getMembers() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('is_active', true)
    .order('order_index');
  
  if (error) throw error;
  return data as Member[];
}

export async function getAllMembers() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('order_index');
  
  if (error) throw error;
  return data as Member[];
}

// Contact
export async function submitContactForm(data: {
   name: string;
   email: string;
   phone?: string;
   subject?: string;
   message: string;
 }) {
   const { error } = await supabase
     .from('contact_submissions')
     .insert([data]);
   
   if (error) throw error;
 }
 
 // Admin Functions
 export async function getContactSubmissions() {
   const { data, error } = await supabase
     .from('contact_submissions')
     .select('*')
     .order('created_at', { ascending: false });
   
   if (error) throw error;
   return data as ContactSubmission[];
 }
 
 export async function markContactAsRead(id: string) {
   const { error } = await supabase
     .from('contact_submissions')
     .update({ is_read: true })
     .eq('id', id);
   
   if (error) throw error;
 }
 
// CRUD operations for specific tables
export async function createDepartment(data: Partial<Department>) {
  const { data: result, error } = await supabase
    .from('departments')
    .insert([data as any])
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateDepartment(id: string, data: Partial<Department>) {
  const { data: result, error } = await supabase
    .from('departments')
    .update(data as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteDepartment(id: string) {
  const { error } = await supabase.from('departments').delete().eq('id', id);
  if (error) throw error;
}

export async function createFaculty(data: Partial<Faculty>) {
  const { data: result, error } = await supabase
    .from('faculty')
    .insert([data as any])
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateFaculty(id: string, data: Partial<Faculty>) {
  const { data: result, error } = await supabase
    .from('faculty')
    .update(data as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteFaculty(id: string) {
  const { error } = await supabase.from('faculty').delete().eq('id', id);
  if (error) throw error;
}

export async function createEvent(data: Partial<Event>) {
  const { data: result, error } = await supabase
    .from('events')
    .insert([data as any])
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateEvent(id: string, data: Partial<Event>) {
  const { data: result, error } = await supabase
    .from('events')
    .update(data as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

export async function createGalleryImage(data: Partial<GalleryImage>) {
  const { data: result, error } = await supabase
    .from('gallery')
    .insert([data as any])
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateGalleryImage(id: string, data: Partial<GalleryImage>) {
  const { data: result, error } = await supabase
    .from('gallery')
    .update(data as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteGalleryImage(id: string) {
  const { error } = await supabase.from('gallery').delete().eq('id', id);
  if (error) throw error;
}

export async function getAllHomepageContent() {
  const { data, error } = await supabase
    .from('homepage_content')
    .select('*')
    .order('order_index');
  if (error) throw error;
  return data as HomepageContent[];
}

export async function updateHomepageContent(id: string, data: Partial<HomepageContent>) {
  const { data: result, error } = await supabase
    .from('homepage_content')
    .update(data as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function getAllAboutSections() {
  const { data, error } = await supabase
    .from('about_section')
    .select('*')
    .order('order_index');
  if (error) throw error;
  return data as AboutSection[];
}

export async function updateAboutSection(id: string, data: Partial<AboutSection>) {
  const { data: result, error } = await supabase
    .from('about_section')
    .update(data as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function getAllDepartments() {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('order_index');
  if (error) throw error;
  return data as Department[];
}

export async function getAllFaculty() {
  const { data, error } = await supabase
    .from('faculty')
    .select('*, departments(*)')
    .order('order_index');
  if (error) throw error;
  return data as Faculty[];
}

export async function getAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Event[];
}

export async function getAllGalleryImages() {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('order_index');
  if (error) throw error;
  return data as GalleryImage[];
}

export async function deleteContactSubmission(id: string) {
  const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
  if (error) throw error;
}

// Members CRUD
export async function createMember(data: Partial<Member>) {
  const { data: result, error } = await supabase
    .from('members')
    .insert([data as any])
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateMember(id: string, data: Partial<Member>) {
  const { data: result, error } = await supabase
    .from('members')
    .update(data as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteMember(id: string) {
  const { error } = await supabase.from('members').delete().eq('id', id);
  if (error) throw error;
}
// Social Links
export async function getSocialLinks() {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .eq('is_active', true)
    .order('order_index');
  if (error) throw error;
  return data;
}