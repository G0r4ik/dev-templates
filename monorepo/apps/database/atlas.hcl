variable "envfile" {
  type    = string
  default = ".env"
}

locals {
  envfile = {
    for line in split("\n", file(var.envfile)) :
    split("=", line)[0] => trimspace(regex("=(.*)", line)[0])
    if !startswith(line, "#") && length(split("=", line)) > 1
  }

  # Функция для удаления кавычек, если они есть
  clean_value = {
    for key, value in local.envfile :
    key => trim(value, "\"'")
  }
}

env "local" {
  url = local.clean_value["DATABASE_URL"]
  src = "file://schema.hcl"
  dev = "docker://postgres/17"
  migration {
    dir = "file://migrations"
  }
  lint {
    destructive {
      error = true
    }
  }
}
env "staging" {
  url = env("DATABASE_URL")
  src = "file://schema.hcl"
  migration {
    dir = "file://migrations"
  }
  lint {
    destructive {
      error = true
    }
  }
}

env "production" {
  url = env("DATABASE_URL")
  src = "file://schema.hcl"
  migration {
    dir              = "file://migrations"
    require_approval = true
  }
  lint {
    destructive {
      error = true
    }
  }
}


