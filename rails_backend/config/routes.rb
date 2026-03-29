Rails.application.routes.draw do
  namespace :api do
    # Projects
    resources :projects, only: [:index, :show, :create, :update, :destroy] do
      member do
        get :stats
      end
    end

    # Images
    resources :images, only: [:index, :show, :destroy] do
      collection do
        get :stats
      end
    end
    # get "images/stats", to: "images#stats"

    # Annotations
    resources :annotations, only: [:index, :show, :create, :update, :destroy]

    # Uploads
    post "upload", to: "uploads#create"

    # Backups
    resources :backups, only: [:index, :create]
  end

  # Serve uploaded files
  get "/uploads/*filename", to: "application#serve_file", as: :serve_file
end
