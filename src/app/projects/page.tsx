"use client";

import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/projects/project-card";
import { useProjectStore, Project } from "@/lib/store/project-store";
import { useState, useEffect } from "react";
import { NewProjectModal } from "@/components/projects/new-project-modal";
import { ProjectDetailsModal } from "@/components/projects/project-details-modal";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useSearchStore } from "@/lib/store/search-store";

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");

  const projects = useProjectStore((state) => state.projects);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const { query, setQuery } = useSearchStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(query.toLowerCase()) || 
                          p.description.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || p.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const resetAllFilters = () => {
    setQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-500 text-sm dark:text-gray-400">Manage and track your projects.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search projects..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 border-gray-100 focus-visible:ring-indigo-400 rounded-xl bg-gray-50/50 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-xl border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all cursor-pointer outline-none select-none flex-1 md:flex-none">
              <Filter className="h-4 w-4 mr-2 text-gray-400" />
              {statusFilter === "All" ? "Status" : `Status: ${statusFilter}`}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl min-w-[150px]">
              <DropdownMenuItem onClick={() => setStatusFilter("All")} className={`cursor-pointer ${statusFilter === "All" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Planning")} className={`cursor-pointer ${statusFilter === "Planning" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>Planning</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("In Progress")} className={`cursor-pointer ${statusFilter === "In Progress" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Completed")} className={`cursor-pointer ${statusFilter === "Completed" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>Completed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-xl border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all cursor-pointer outline-none select-none flex-1 md:flex-none">
              <Filter className="h-4 w-4 mr-2 text-gray-400" />
              {priorityFilter === "All" ? "Priority" : `Priority: ${priorityFilter}`}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl min-w-[150px]">
              <DropdownMenuItem onClick={() => setPriorityFilter("All")} className={`cursor-pointer ${priorityFilter === "All" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>All Priorities</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("Low")} className={`cursor-pointer ${priorityFilter === "Low" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>Low</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("Medium")} className={`cursor-pointer ${priorityFilter === "Medium" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>Medium</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("High")} className={`cursor-pointer ${priorityFilter === "High" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>High</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard 
            key={project.id} 
            {...project} 
            onClick={() => {
              setSelectedProject(project);
              setIsDetailsOpen(true);
            }}
            onDelete={() => {
              deleteProject(project.id);
            }}
          />
        ))}
        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              No projects found matching the selected filters.
            </p>
            <Button variant="ghost" className="mt-2 text-indigo-600 dark:text-indigo-400" onClick={resetAllFilters}>
              Reset Filters & Search
            </Button>
          </div>
        )}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all group min-h-[200px]"
        >
          <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 group-hover:text-indigo-600 mb-3 transition-colors">
            <Plus className="h-6 w-6" />
          </div>
          <span className="text-sm font-semibold text-gray-500 group-hover:text-indigo-600 transition-colors">
            Add New Project
          </span>
        </button>
      </div>

      <NewProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <ProjectDetailsModal 
        project={selectedProject}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
}

